import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';

import { Interaction } from '../interaction';
import { InteractionService } from '../interaction.service';
import { InteractionCreateDialogComponent } from '../dialogs/interaction-create.dialog';

import { ShoutService } from '../../common/shout.service';
import { AuthService } from 'mh-core';

import { Person } from 'mh-core';

@Component({
    selector: 'mh-interaction-list',
    templateUrl: 'interaction-list.component.html',
    styleUrls: ['interaction-list.component.scss', '../interaction-common.styles.scss']
})
export class InteractionListComponent implements OnInit {
    private author: Person;
    dialogRef: MdDialogRef<InteractionCreateDialogComponent>;
    @Input() interactions: Array<Interaction>;

    constructor(private route: ActivatedRoute,
                private interactionService: InteractionService,
                private shout: ShoutService,
                private auth: AuthService,
                public dialog: MdDialog) {
    }

    ngOnInit(): void {
        this.author = this.auth.getCurrentUser();
        if (!this.interactions) {
            this.route.params
                .switchMap((params: Params) => this.interactionService.getInteractions(params['id']))
                .subscribe((interactions: Array<Interaction>) => {
                    this.interactions = interactions;
                });
        }
    }

    iOwn(uid: string): boolean {
        return uid === this.author.uid;
    }

    deleteInteraction(interaction: Interaction): void {

        if (!this.iOwn(interaction.authorId)) {
            return;
        }
        this.interactionService.deleteInteraction(interaction)
            .subscribe(
                (data: string) => {
                    this.interactions.splice(this.interactions.indexOf(interaction), 1);
                    this.shout.success('Interaction is deleted!');
                    return true;
                },
                (error: any) => {
                    this.shout.error('Error in interaction delete!');
                    // console.log(error);
                    return false;
                }
            );
    }
    openDlgInteractions(interaction: Interaction): void {
        let oldInteraction: Interaction = interaction;
        let config: MdDialogConfig = new MdDialogConfig();
        config.data = {
            interaction: interaction
        };

        this.dialogRef = this.dialog.open(InteractionCreateDialogComponent, config);
        this.dialogRef.afterClosed().subscribe((result: any) => {
            if (result instanceof Interaction) {
                this.interactions.splice(this.interactions.indexOf(oldInteraction));
                this.interactions.unshift(result);
            }
            this.dialogRef = undefined;
        });
    }
}
