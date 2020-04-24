import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';

import { Poll } from '../../../shared/models/poll.interface';
import { PollService } from '../../../shared/services/poll.service';
import { Store } from 'store';

@Component({
  selector: 'app-view',
  styleUrls: ['./view.component.scss'],
  template: `
    
    <main>
    <button 
      [routerLink]="['create']"
      mat-button mat-raised-button [color]="'primary'" 
      class="d-block has-icon dark-icon button-large mb-3"><i class="fa fa-plus-square"></i>Create Poll</button>

   <h1 class="mb-2 mt-2">My Polls</h1>
      <hr class="mb-2" />
    <div *ngIf="polls$ | async as polls; else loading;" class="pb-5">

        <mat-card *ngFor="let poll of polls" [routerLink]="[poll.id]" class="mb-1 linked-card">
          <mat-card-title>{{poll.title}}</mat-card-title>
          <mat-card-subtitle>{{poll.is_published ? 'Published' : 'Draft' }} - {{poll.is_open ? 'Open' : 'Closed' }} – {{poll.vote_count ? poll.vote_count + ' votes' : 'No Votes'}} {{ poll.is_promoted ? ' – Promoted Poll' : '' }}</mat-card-subtitle>
        </mat-card>

        <mat-card *ngIf="!polls.length">
          <mat-card-title>No polls yet! How about <a [routerLink]="['create']">creating one</a>?</mat-card-title>
        </mat-card>
        
    </div>

    <ng-template #loading>
      <div class="message">
        <img src="/assets/images/loading.svg" alt="" />
        Fetching polls...
      </div>
    </ng-template>
    </main>

  `
})
export class ViewComponent implements OnInit {
  polls$: Observable<Poll[]>;
  subscription: Subscription;
  constructor(
              private store: Store, 
              private db: AngularFirestore, 
              private pollService:PollService) {}

  ngOnInit() {
    this.store.set('backButton', 'home');
    this.polls$ = this.store.select<Poll[]>('polls');
    // this.subscription = this.pollService.polls$.subscribe(); // returns subscription
    this.subscription = this.pollService.getUserPolls().subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
