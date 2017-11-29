<?php
namespace app\controllers;

use app\models\Family;
use app\models\Person;
use app\models\PersonTag;
use app\models\Tag;
use app\models\User;
use yii\web\BadRequestHttpException;
use yii\web\NotFoundHttpException;

class PersonController extends MHController
{
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['access'] = [
            'class' => \yii\filters\AccessControl::className(),
            'rules' => [
                [
                    'actions' => [
                        'list','get','update', 'delete', 'update-column',
                        'create','search','avatar-upload', 'update-family'
                    ],
                    'allow' => true,
                    'roles' => ['@'],
                ],
            ],
        ];
        return $behaviors;
    }

    /**
     * @inheritdoc
     */
    public function beforeAction($action)
    {
        if ($action->id == 'update'
            || $action->id == 'update-column'
            || $action->id == 'update-family'
            || $action->id == 'avatar-upload'
            || $action->id == 'create'
            || $action->id == 'delete'
        ) {
            $this->enableCsrfValidation = false;
        }

        return parent::beforeAction($action);
    }

    // returns Person
    public function actionAvatarUpload()
    {
        $ret = [];
        $post = \Yii::$app->request->post();
        $split = explode(',', $post['base']);
        $data = null;

        if (!isset($post['base'])) {
            throw new BadRequestHttpException('No image data received');
        }
        if (!isset($post['id']) || empty($post['id'])) {
            throw new BadRequestHttpException('No person id received');
        }

        $person = Person::findOne(['uid'=>$post['id']]);

        // this freaky conversion is because we cannot (yet) pass the file type in avatar-edit.dialog.ts
        // additional downside: the image cropper wants to convert everything to .png!
        // TODO: this needs revision!
        $ftype = explode(';', $split[0]);
        $type = explode('/', $ftype[0])[1];

        $type = ($type=='jpeg') ? 'jpg' : $type;
        $data = base64_decode($split[1]);

        // set the proper path to save so that Angular can read the image
        // should be ./assets/images/avatar, so that images get uploaded correctly on dev and prod?
        $dir = file_exists(__DIR__ . '/../config/debug.php') ? 'web' : 'src';

        $imagePath =  \Yii::getAlias('@webroot') . "/../$dir/assets/images/avatar/person/";
        $image = $post['id'] . '.' . $type;

        if (file_put_contents($imagePath . $image, $data)) {
            // don't store the actual url here, the app should define where the files are located
            // this will make moving of files easier
            $person->avatarUrlSmall = $image;
            if (!$person->save()) {
                throw new BadRequestHttpException($person->errors);
            }
            $ret[] = $person;
        }

        return ['response' => $ret];
    }

    public function actionList()
    {
        $ret = [];
        $people = Person::find()
            ->with('user')
            ->orderBy(['lastName' => SORT_ASC])
            ->all();

        foreach ($people as $person) {
            $ret[] = $person->toResponseArray();
        }
        return $ret;
    }

    public function actionSearch()
    {
        $ret = [];
        // TODO: include relevant joins here. Don't allow lazy loading (too many calls)
        foreach (Person::find()->each() as $person) {
            $ret[] = $person->toResponseArray();
        }
        return ['response' => $ret];
    }

    public function actionGet($id)
    {
        $person = $this->findModelByUID($id);
        return ['response' => $person->toResponseArray()];
    }

    public function actionUpdateColumn($id)
    {
        $person = $this->findModelByUID($id);
        $post = \Yii::$app->request->post();
        if ($person && !empty($post['name'])) {
            $person->{$post['name']} = trim(json_encode($post['value']));
            if (!$person->save()) {
                throw new BadRequestHttpException(json_encode($person->errors));
            }
        } else {
            throw new BadRequestHttpException('Bad parameters encountered!');
        }
        return ['response' => $person->toResponseArray()];
    }

    public function actionUpdate($id)
    {
        $person = $this->findModelByUID($id);
        $person->scenario = PERSON::SCENARIO_EDIT;
        $post = \Yii::$app->request->post();
        if ($person && $post) {
            $person = $this->setPerson($person, $post);
            $user = $this->setUser($person, $post);
            if (!$person->save()) {
                throw new BadRequestHttpException(json_encode($person->errors));
            }
            $this->saveTags($person, $post);
            if (isset($user)) {
                $person->user = $user;
                if (!isset($post['user']['noCredentials'])
                    || empty($post['user']['noCredentials'])
                ) {
                    $this->sendCredentials($person, trim($post['user']['password']));
                }
            }
            return $person->toResponseArray();
        } else {
            throw new BadRequestHttpException(json_encode($person->errors));
        }
    }

    public function actionCreate()
    {
        $post = \Yii::$app->request->post();
        $person = new Person(['scenario' => PERSON::SCENARIO_NEW]);
        $person = $this->setPerson($person, $post);
        $user = $this->setUser($person, $post);
        if ($person->save()) {
            $this->saveTags($person, $post);
            if (isset($user)) {
                $person->user = $user;
                if (!isset($post['user']['noCredentials'])
                    || empty($post['user']['noCredentials'])
                ) {
                    $this->sendCredentials($person, trim($post['user']['password']));
                }
            }
            return $person->toResponseArray();
        } else {
            throw new BadRequestHttpException(json_encode($person->errors));
        }
    }

    public function actionDelete($id)
    {
        $person = $this->findModelByUID($id);
        $ret = ['id'=>$person->id, 'fullName'=>$person->fullName];
        $result = $person->delete();
        if ($result === false) {
            throw new BadRequestHttpException('Could not delete person with ID ' . $id);
        }
        return $ret;
    }

    protected function saveTags($person, $post)
    {
        $ptags_prv = PersonTag::find(['person_id'=>$person->id]);
        if (!empty($ptags_prv)) {
            $person->unlinkAll('tags', true);
        }
        if (!empty($post['status'])) {
            foreach ($post['status'] as $tag) {
                $tagCheck = Tag::findOne(['text' => trim($tag['text'])]);
                if (empty($tagCheck)) {
                    $newTag = new Tag();
                    $newTag->text = trim($tag['text']);
                    $newTag->context = 'person';
                    $newTag->type = 'status';
                    if ($newTag->save()) {
                        $newTag->link('person', $person);
                    } else {
                        throw new BadRequestHttpException('Tag: ' . json_encode($newTag->errors));
                    }
                } else {
                    $tagCheck->link('person', $person);
                }
            }
        }
    }

    protected function setPerson($person, $post): Person
    {
        // throw new BadRequestHttpException(json_encode($post));
        $person->firstName = $post['firstName'];
        $person->middleName = $post['middleName'];
        $person->lastName = $post['lastName'];
        $person->email = $post['email'];
        $person->gender = $post['gender'];
        $person->maritalStatus = $post['maritalStatus'];
        $person->address = json_encode($post['address']);
        $person->phoneHome = $post['phoneHome'];
        $person->phoneWork = $post['phoneWork'];
        $person->phoneMobile = $post['phoneMobile'];
        $person->birthday = !empty($post['birthday'])
            ? date('Y-m-d', strtotime($post['birthday']))
            : null;
        $person->baptized = !empty($post['baptized'])
            ? date('Y-m-d', strtotime($post['baptized']))
            : null;
        $person->anniversary = !empty($post['anniversary'])
            ? date('Y-m-d', strtotime($post['anniversary']))
            : null;
        return $person;
    }

    protected function setUser($person, $post)
    {
        $user = null;
        if (empty($person->user) && !empty($post['user']['password'])) {
            $user = new User();
            $user->personId = $person->id;
            $user->username = trim($post['user']['username']);
            $user->setPassword(trim($post['user']['password']));
            if (!$user->save()) {
                throw new BadRequestHttpException(json_encode($user->errors));
            }
        } elseif (!empty($person->user) && !empty($post['user']['password'])) {
            $user = $person->user;
            $user->username = trim($post['user']['username']);
            $user->setPassword(trim($post['user']['password']));
            if (!$user->save()) {
                throw new BadRequestHttpException(json_encode($user->errors));
            }
        }
        return $user;
    }

    protected function findModel($id): Person
    {
        $person = Person::find()->with('tags')->where(['uid'=>$id])->one();
        if ($person === null) {
            throw new NotFoundHttpException('The requested person does not exist.');
        }
        return $person;
    }
    protected function findModelByUID($id): Person
    {
        $person = Person::find()->with('tags')->where(['uid'=>$id])->one();
        if ($person === null) {
            throw new NotFoundHttpException('The requested person does not exist.');
        }
        return $person;
    }

    // TODO: make this into an authenticate process
    private function sendCredentials($person, $pw)
    {
        \Yii::$app->mailer
            ->compose(
                'newpw',
                [
                    'name' => $person->firstName,
                    'username' => $person->user->username,
                    'password' => $pw
                ]
            )
            ->setFrom('mailbee@memberhive.com')
            ->setTo('thomas.hochstetter@me.com') //$person->email
            ->setSubject('MH - New Credentials')
            ->send();
    }
}
