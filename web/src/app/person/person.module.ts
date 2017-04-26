import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppMaterialModule } from '../app-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InteractionModule } from '../interaction/interaction.module';
import { AuditModule } from '../audit/audit.module';

import { KeysPipe } from '../common/keys.pipe';

import { PersonComponent } from './person.component';
import { PersonListComponent } from './list/person-list.component';
import { PersonViewComponent } from './view/person-view.component';
import { PersonEditComponent } from './edit/person-edit.component';

import { PersonRelationsDialogComponent } from './dialogs/person-relations.dialog';
import { AvatarEditDialogComponent } from './dialogs/avatar-edit.dialog';

import { PersonRoutingModule } from './person-routing.module';

import { ImageCropperModule } from 'ng2-img-cropper';

import { TitleService } from 'mh-core';
import { PersonService } from './person.service';
import { ShoutService } from '../common/shout.service';

@NgModule({
    declarations: [
        PersonComponent,
        PersonListComponent,
        PersonViewComponent,
        PersonEditComponent,
        PersonRelationsDialogComponent,
        AvatarEditDialogComponent,
        KeysPipe
    ],
    imports: [
        CommonModule,
        AppMaterialModule,
        PersonRoutingModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        InteractionModule,
        AuditModule,
        ImageCropperModule
    ],
    providers: [
        PersonService,
        ShoutService,
        DatePipe,
        KeysPipe
    ],
    entryComponents: [
        PersonRelationsDialogComponent,
        AvatarEditDialogComponent
    ]
})
export class PersonModule {
    constructor(titleService: TitleService) {
        titleService.changeModule('Persons');
    }
}
