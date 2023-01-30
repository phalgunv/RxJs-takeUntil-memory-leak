import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  interval,
  of,
  switchMap,
  tap,
  takeUntil,
  Subject,
  Observable,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'my-app',
  template: `
  <input type="checkbox" [(ngModel)]="isChecked" /> Child Component
    {{ isChecked ? 'Created' : 'Destroyed' }}
  <app-child *ngIf="isChecked"></app-child>
  `,
})
export class AppComponent {
  isChecked = true;
}

@Component({
  selector: 'app-child',
  template: `
  <p>Hello from Child component</p>
  `,
})
export class ChildComponent implements OnInit, OnDestroy {
  parentStream$: Observable<boolean>;
  private destroy$: Subject<any> = new Subject<any>();
  subscription1: Subscription;
  subscription2: Subscription;
  constructor() {
    this.parentStream$ = of(true);
  }

  ngOnInit(): void {
    console.log('ngOnInit');

    /*
    Uncomment the below code to see the memory leak
    Explanation:
    Here we subscribe to the observable returned by interval(), so even when the component gets destroyed interval() keeps emitting next notifications
    and the subscription remains active even after the component is destroyed
    */

    // this.subscription1 = this.parentStream$
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     switchMap(() => interval(1000)),
    //     tap({
    //       next: () => console.log('I love memory leaks! ♥️'),
    //       error: (e) => console.error(e),
    //       complete: () => console.info('complete'),
    //     })
    //   )
    //   .subscribe();

    /*
    Why does below code not result in memory leaks?
    Explanation:
    Here we subscribe to the observable returned by takeUntil(). Now when the component gets destroyed, the observable returned by takeUntil() completes and no new next notifications are emitted.    
    */
    this.subscription2 = this.parentStream$
      .pipe(
        switchMap(() => interval(1000)),
        takeUntil(this.destroy$),
        tap({
          next: () => console.log('Game over for memory leaks! 💪'),
          error: (e) => console.error(e),
          complete: () => console.info('complete'),
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
