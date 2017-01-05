import {NgModule} from '@angular/core';
import {Title}  from '@angular/platform-browser';

import {CovalentCoreModule} from '@covalent/core';

import {PersonComponent} from './person.component';
import {PersonListComponent} from './list/person-list.component';
import {PersonViewComponent} from './view/person-view.component';

import {PersonRoutingModule} from './person-routing.module';

@NgModule({
    declarations: [
        PersonComponent,
        PersonListComponent,
        PersonViewComponent
    ],
    imports: [
        PersonRoutingModule,
    ],
    providers: [
        Title,
    ],
})
export class PersonModule {
}
