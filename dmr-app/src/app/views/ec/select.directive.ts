import { Directive, AfterViewInit, ElementRef, OnDestroy, OnChanges, HostListener, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IScanner } from 'src/app/_core/_model/IToDoList';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[autoselect]'
})
export class AutoSelectDirective implements AfterViewInit, OnInit, OnDestroy {
  subject = new Subject<string>();
  subscription: Subscription[] = [];
  isShow: boolean;
  @HostListener('focus') onFocus() {
    setTimeout( () => {
      this.host.nativeElement.select();
    }, 300);
  }
  @HostListener('focusout', ['$event']) onFocusout(value) {
    setTimeout(() => {
      this.host.nativeElement.focus();
      this.host.nativeElement.select();
    }, 300);
  }
  // 74 Ctrl + Enter , 9 tab
  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 74 || event.keyCode === 9) {
      event.preventDefault();
    }
  }
  @HostListener('ngModelChange', ['$event']) onChange(value) {
    this.subject.next(value);
  }
  constructor(private host: ElementRef ) { }
  ngAfterViewInit() {
    setTimeout(() => {
      this.host.nativeElement.focus();
    }, 500);
  }
  ngOnInit() {
    this.subscription.push(this.subject
      .pipe(
        debounceTime(1000)
        )
      .subscribe(async (arg) => {
        this.host.nativeElement.focus();
        this.host.nativeElement.select();
      }));
  }
  ngOnDestroy() {
    this.subscription.forEach(item => item.unsubscribe());
  }
  // @HostListener('document:keydown.enter', ['$event'])
  // onKeydownHandler(event: KeyboardEvent) {
  //   event.preventDefault();
  //   this.host.nativeElement.value = this.host.nativeElement.value + '    ';
  //   this.host.nativeElement.value = this.host.nativeElement.value.replaceAll('    ' || '          ', '    ');
  // }
  // @HostListener('document:keydown.tab', ['$event'])
  // onKeydownTabHandler(event: KeyboardEvent) {
  //   event.preventDefault();
  // }
  @HostListener('window:keydown', ['$event'])
  spaceEvent(event: any) {
    event.preventDefault();
    if (event.ctrlKey && event.keyCode === 74) {
      this.host.nativeElement.value = this.host.nativeElement.value + '    ';
    }
  }
}
