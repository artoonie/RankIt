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
    
    <button mat-button mat-raised-button [color]="'primary'">Create Poll</button>

    <h1>My Polls</h1>

<div *ngIf="polls$ | async as polls; else loading;">

    <mat-card *ngFor="let poll of polls">
    <mat-card-title>{{poll.title}}</mat-card-title>
    <mat-card-subtitle>Open – 50 votes</mat-card-subtitle>
  </mat-card>
    
</div>

  <ng-template #loading>
      <div class="message">
        <img src="/assets/images/loading.svg" alt="" />
        Fetching polls...
      </div>
    </ng-template>

  `
})
export class ViewComponent implements OnInit {
  polls$: Observable<Poll[]>;
  subscription: Subscription;
  constructor(
              private store: Store, 
              private db: AngularFirestore, 
              private pollService:PollService) {
    // this.polls = db.collection('items').valueChanges();
  }

  ngOnInit() {
    this.polls$ = this.store.select<Poll[]>('polls');
    this.subscription = this.pollService.polls$.subscribe(); // returns subscription
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
