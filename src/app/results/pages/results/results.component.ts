import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from 'store';
import { Observable, Subscription } from 'rxjs';
import { map, distinct } from 'rxjs/operators';

import { AppSettings } from '../../../app.settings';

import { Poll, Vote, Choice, Results } from '../../../shared/models/poll.interface';
import { VoteService } from '../../../shared/services/vote.service';

@Component({
  selector: 'app-results',
  styleUrls: ['./results.component.scss'],
  template: `
    
      <div *ngIf="poll$ | async as poll; else loading;">
      <header class="poll-header">
          <h1 class="">{{poll.title}}</h1>  
      </header>

      <main class="clear-footer" *ngIf="poll.results as results; else noResults">
          <div class="alert mt-3" *ngIf="poll.vote_count < poll.choices.length">
            <div>
              Heads up: this poll doesn't have many votes yet. Results are displayed below, but the results will be more meaningful once more people have voted. 
            </div>
          </div>
          <h2 class="mt-3 mb-1">
            {{ (round === 0) ? 'Final Result' : 'Round ' + round }}
            <span *ngIf="round === getTotalRounds(results)">(Final Result)</span>
          </h2>
          <p class="mb-1">{{poll.vote_count}} Votes in 3 Rounds</p>
          
          <hr>

          <div class="mb-3 mt-1">
            <results-graph 
              [results]="shiftedResults$ | async" 
              [all_choices]="poll.choices"
              [round]="round"
              [total_rounds]="poll.results.rounds.length"
              [winner_count]="poll.winner_count"></results-graph>
          </div>

          <hr>

          <h2 class="mt-3 mb-1">{{ round === 0 ? 'Poll' : 'Round'}} Summary</h2>

          <results-explanation 
              [results]="shiftedResults$ | async" 
              [all_choices]="poll.choices"
              [round]="round"
              [total_rounds]="poll.results.rounds.length"
              [total_votes]="poll.vote_count"
              [winner_count]="poll.winner_count"></results-explanation> 
      </main>

      <footer class="actions">
      <div class="half">
        <button
          *ngIf="round !== 0" 
          (click)="toRound(lastRound, poll)"
          mat-button mat-raised-button [color]="'white'" 
          class="d-block button-large p-1">Back</button>
      </div>
      <div class="half">
        <button
          *ngIf="round < poll.results.rounds.length" 
          (click)="toRound(nextRound, poll)"
          mat-button mat-raised-button [color]="'primary'" 
          class="d-block button-large p-1">See Round {{ nextRound }}</button>
        <button
          mat-button mat-raised-button [color]="'primary'" 
          class="d-block button-large p-1"
          *ngIf="round ===poll.results.rounds.length" >
          Continue button TODO
        </button>
      </div>
    </footer>
     </div>


      <ng-template #noResults>
          <div class="message">
            so...there aren't any results yet.TODO
          </div>
      </ng-template>


      <ng-template #loading>
          <div class="message">
            <img src="/assets/images/loading.svg" alt="" />
            Fetching poll...
          </div>
      </ng-template>



  `
})
export class ResultsComponent implements OnInit {
    poll$: Observable<Poll> = this.store.select('poll');

    shiftedResults$:Observable<Results> = this.store.select('poll')
    .pipe(
          distinct(),
          map((poll:Poll) => this.getShiftedRounds(poll.results)));

    // Local state :)
    round: number;
    shiftedResults: Results;
    // user$: Observable<any> = this.store.select('user')
    // .pipe(distinct(),
    //       map(user => this.store.set('backButton', '/polls')));

    subscription: Subscription;


  constructor(
              private location:Location,
              private http:HttpClient,
              private router:Router,
              private voteService:VoteService,
              private route:ActivatedRoute,
              private store:Store) { 
  }

  ngOnInit() {
    // this.subscription = this.user$.subscribe();

    let user = this.route.snapshot.data.resolverUser;

    this.route.paramMap
      .subscribe((params:ParamMap) => {
        let id = params.get('id');

        this.round = (params.get('round') === 'summary') ? 0 : parseInt(params.get('round'));

        console.log(params);
        if(id) {
          this.poll$ = this.voteService.getPoll(id);

          if(user) {
            this.store.set('backButton', ['/polls/', id]);
          } else {
            this.store.set('backButton', `/`);
          }
        } else {
          this.router.navigate(['/vote/not-found']);
         
        }
       
      });
  }

  /**
    * Shifted Rounds fixes the 0 index problem.
    *   Since we want to display the final round up front, 
    *   and each round is numbered starting from 1, it simplifies.
    */
  getShiftedRounds(results:Results) {
    const lastRound = results.rounds.slice(-1)[0];    
    const shiftedResults = {...results, rounds: [...results.rounds]};

    shiftedResults.rounds.unshift(lastRound);
    return shiftedResults;
  }

  getLastRound(results:Results) {
    return results.rounds.length;
  }

  getTotalRounds(results:Results) {
    return results.rounds.length;
  }

  toRound(destination:number, poll:Poll) {

    // update local state
    this.round = destination;

    // tell the router about the change.
    this.updateLocation(destination, poll.id);

  }

  updateLocation(currentRound:number | 'summary', id:string) {
    const destination = (currentRound > 0) ? currentRound : 'summary';
    return window.history.pushState({}, '', `/results/${id}/${destination}`);
  }

  get nextRound() {
    return this.round + 1;
  }
  get lastRound() {
    return this.round - 1;
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }

}
