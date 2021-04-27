import { navItems } from '../../_nav';

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from '../../_core/_service/auth.service';
import { AlertifyService } from '../../_core/_service/alertify.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/_core/_service/header.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CalendarsService } from 'src/app/_core/_service/calendars.service';
import { IHeader } from 'src/app/_core/_model/header.interface';
import * as moment from 'moment';
import { Nav } from 'src/app/_core/_model/nav';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from 'src/app/_core/_service/role.service';
import { CookieService } from 'ngx-cookie-service';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { DataService } from 'src/app/_core/_service/data.service';
import { PermissionService } from 'src/app/_core/_service/permission.service';
import { AuthenticationService } from 'src/app/_core/_service/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { INavData } from '@coreui/angular';
import { VersionService } from 'src/app/_core/_service/version.service';
declare var require: any;
import * as signalr from '../../../assets/js/ec-client.js';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['default-layout.component.css']
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit {
  public sidebarMinimized = false;
  public navItems = navItems;
  public navAdmin: any;
  public navClient: any;
  navEc: any;
  public total: number;
  public totalCount: number;
  public page: number;
  public ADMIN = 1;
  public SUPERVISOR = 2;
  public ADMIN_COSTING = 5;
  public STAFF = 3;
  public WORKER = 4;
  public WORKER2 = 6;
  public DISPATCHER = 6;
  public pageSize: number;
  public currentUser: string;
  public currentTime: any;
  userid: number;
  level: number;
  roleName: string;
  role: any;
  avatar: any;
  vi: any;
  en: any;
  langsData: object[];
  public fields = { text: 'name', value: 'id' };
  public value: string;
  zh: any;
  menus: any;
  modalReference: any;

  online: number;
  userID: number;
  userName: any;
  data: [] = [];
  firstItem: any;
  constructor(
    private versionService: VersionService,
    private authService: AuthService,
    private authenticationService: AuthenticationService,
    private roleService: RoleService,
    private alertify: AlertifyService,
    private permissionService: PermissionService,
    private headerService: HeaderService,
    private calendarsService: CalendarsService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private dataService: DataService,
    private spinner: NgxSpinnerService,
    private cookieService: CookieService,
    private modalService: NgbModal,
    public translate: TranslateService

  ) {
    this.role = JSON.parse(localStorage.getItem('level'));
    const lang = localStorage.getItem('lang');
    if (lang) {
      this.value = lang;
      translate.setDefaultLang(lang);
      translate.use(lang);

    } else {
      this.value = 'vi';
      translate.setDefaultLang('vi');
      translate.use('vi');
    }
    this.authenticationService.user$.subscribe(x => {
      this.userName = x.username;
      this.userID = x.id;
    });
  }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  ngOnInit(): void {
    if (signalr.CONNECTION_HUB.state === HubConnectionState.Connected) {
      signalr.CONNECTION_HUB
        .invoke('CheckOnline', this.userID, this.userName)
        .catch(error => {
          console.log(`CheckOnline error: ${error}`);
        }
        );
      signalr.CONNECTION_HUB.on('Online', (users) => {
        this.online = users;
      });

      signalr.CONNECTION_HUB.on('UserOnline', (userNames: any) => {
        const userNameList = JSON.stringify(userNames);
        localStorage.setItem('userOnline', userNameList);
      });
    }
    this.versionService.getAllVersion().subscribe((item: any) => {
      this.data = item;
      this.firstItem = item[0] || {};
    });
    this.vi = require('../../../assets/ej2-lang/vi.json');
    this.en = require('../../../assets/ej2-lang/en-US.json');
    this.langsData = [{ id: 'vi', name: 'VI' }, { id: 'en', name: 'EN' }];
    this.navAdmin = new Nav().getNavAdmin();
    this.navClient = new Nav().getNavClient();
    this.navEc = new Nav().getNavEc();
    // this.checkTask();
    this.getAvatar();
    this.currentUser = JSON.parse(localStorage.getItem('user')).user.username;
    this.page = 1;
    this.pageSize = 10;
    // this.signalrService.startConnection();
    this.userid = JSON.parse(localStorage.getItem('user')).user.id;
    this.getMenu();
    this.onService();
    this.currentTime = moment().format('hh:mm:ss A');
    setInterval(() => this.updateCurrentTime(), 1 * 1000);
  }
  ngAfterViewInit() {
    this.getBuilding();
    const img = localStorage.getItem('avatar');
    if (img === 'null') {
      this.avatar = this.defaultImage();
    } else {
      this.avatar = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64, ' + img);
    }
  }

  getMenu() {
    this.spinner.show();
    this.permissionService.getMenuByUserPermission(this.userid).subscribe((menus: any[]) => {
      this.menus = menus;
      const navs: INavData[] = [
        {
          name: 'Home',
          url: '/',
          icon: 'icon-home',
          badge: {
            variant: 'info',
            text: ''
          }
        },
        {
          title: true,
          name: 'Mixing Room'
        },
      ];
      for (const item of menus) {
        const children = [];
        const node = {
          name: item.module,
          url: item.url,
          icon: item.icon || "icon-star",
          children: []
        };
        for (const child of item?.children) {
          const itemChild = {
            name: child.name,
            url: child.url,
            icon: "far fa-circle"
            // icon: item.icon || 'fa fa-circle'
          };
          children.push(itemChild);
        }
        node.children = children;
        navs.push(node);
      }
      console.log(navs);
      this.navItems = navs;
      this.spinner.hide();
      localStorage.setItem('menus', JSON.stringify(menus));
    }, (err) => {
      this.spinner.hide();
    });
  }
  home() {
    if (this.role.id === this.STAFF) {
      return '/ec/execution/todolist-2';
    } else {
      return '/ec/execution/todolist-2';
    }
  }
  onChange(args) {
    if (args.itemData) {
      localStorage.removeItem('lang');
      localStorage.setItem('lang', args.itemData.id);
      this.translate.use(args.itemData.id);
      if (args.itemData.id === 'vi') {
        this.dataService.setValueLocale(args.itemData.id);
        setTimeout(() => {
          L10n.load(this.vi);
          setCulture('vi');
        }, 500);
        location.reload();
      } else {
        this.dataService.setValueLocale(args.itemData.id);
        setTimeout(() => {
          L10n.load(this.en);
          setCulture('en-US');
          location.reload();
        }, 500);
      }
    }
  }
  getBuilding() {
    const userID = JSON.parse(localStorage.getItem('user')).user.id;
    this.roleService.getRoleByUserID(userID).subscribe((res: any) => {
      res = res || {};
      if (res !== {}) {
        this.level = res.id;
      }
    });
  }
  onService() {
    this.headerService.currentImage
      .subscribe(arg => {
        if (arg) {
          this.changeAvatar(arg);
        }
      });
  }
  changeAvatar(avt) {
    let avatar;
    if (avt) {
      avatar = avt.replace('data:image/png;base64,', '').trim();
      localStorage.removeItem('avatar');
      localStorage.setItem('avatar', avatar);
      this.getAvatar();
    } else {
      this.avatar = this.defaultImage();
    }

  }

  updateCurrentTime() {
    this.currentTime = moment().format('hh:mm:ss A');
  }
  logout() {
    this.cookieService.deleteAll();
    localStorage.clear();
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.authenticationService.logOut();
    const uri = this.router.url;
    this.router.navigate(['login'], { queryParams: { uri }, replaceUrl: true });
    this.alertify.message('Logged out');

  }

  defaultImage() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAJYAA
      ACWBAMAAADOL2zRAAAAG1BMVEVsdX3////Hy86jqK1+ho2Ql521ur7a3N7s7e5Yhi
      PTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABAElEQVRoge3SMW+DMBiE4YsxJqMJtH
      OTITPeOsLQnaodGImEUMZEkZhRUqn92f0MaTubtfeMh/QGHANEREREREREREREtIJ
      J0xbH299kp8l8FaGtLdTQ19HjofxZlJ0m1+eBKZcikd9PWtXC5DoDotRO04B9YOvF
      IXmXLy2jEbiqE6Df7DTleA5socLqvEFVxtJyrpZFWz/pHM2CVte0lS8g2eDe6prOy
      qPglhzROL+Xye4tmT4WvRcQ2/m81p+/rdguOi8Hc5L/8Qk4vhZzy08DduGt9eVQyP
      2qoTM1zi0/uf4hvBWf5c77e69Gf798y08L7j0RERERERERERH9P99ZpSVRivB/rgAAAABJRU5ErkJggg==`);
  }
  getAvatar() {
    const img = localStorage.getItem('avatar');
    if (img === 'null') {
      this.avatar = this.defaultImage();
    } else {
      this.avatar = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64, ' + img);
    }
  }
  imageBase64(img) {
    if (img === 'null') {
      return this.defaultImage();
    } else {
      return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64, ' + img);
    }
  }
  datetime(d) {
    return this.calendarsService.JSONDateWithTime(d);
  }

  openModal(ref) {
    this.modalReference = this.modalService.open(ref, { size: 'xl', backdrop: 'static', keyboard: false });

  }
}
