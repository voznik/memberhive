import { Component, Input, forwardRef, Optional, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MhLayoutComponent } from '../layout.component';

@Component({
  selector: 'mh-layout-nav',
  styleUrls: ['./layout-nav.component.scss' ],
  templateUrl: './layout-nav.component.html'
})
export class MhLayoutNavComponent {

  /**
   * toolbarTitle?: string
   *
   * Title set in toolbar.
   */
  @Input('toolbarTitle') toolbarTitle: string;

  /**
   * icon?: string
   *
   * icon name to be displayed before the title
   */
  @Input('icon') icon: string;

  /**
   * logo?: string
   *
   * logo icon name to be displayed before the title.
   * If [icon] is set, then this will not be shown.
   */
  @Input('logo') logo: string;

  /**
   * color?: string
   *
   * toolbar color option: primary | accent | warn.
   * If [color] is not set, primary is used.
   */
  @Input('color') color: string = 'primary';

  /**
   * navigationRoute?: string
   *
   * option to set the combined route for the icon, logo, and toolbarTitle.
   */
  @Input('navigationRoute') navigationRoute: string;

  /**
   * Checks if there is a [MhLayoutComponent] as parent.
   */
  get isMainSidenavAvailable(): boolean {
    return !!this._layout;
  }

  /**
   * Checks if router was injected.
   */
  get routerEnabled(): boolean {
    return !!this._router && !!this.navigationRoute;
  }

  constructor(@Optional() @Inject(forwardRef(() => MhLayoutComponent)) private _layout: MhLayoutComponent,
              @Optional() private _router: Router) {}

  handleNavigationClick(): void {
    if (this.routerEnabled) {
      this._router.navigateByUrl(this.navigationRoute);
    }
  }

  /**
   * If main sidenav is available, it will open the sidenav of the parent [MhLayoutComponent].
   */
  openMainSidenav(): void {
    this._layout.toggle();
  }
}
