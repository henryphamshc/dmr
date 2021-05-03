import { filter } from 'rxjs/operators';
import { EmitType } from '@syncfusion/ej2-base';
import { BaseComponent } from 'src/app/_core/_component/base.component';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FilterService, GridComponent, QueryCellInfoEventArgs, ReorderService, SortService } from '@syncfusion/ej2-angular-grids';
import { AlertifyService } from 'src/app/_core/_service/alertify.service';
import { PermissionService } from 'src/app/_core/_service/permission.service';
import { TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { ActivatedRoute } from '@angular/router';
import { SystemConstant } from 'src/app/_core/_constants';

@Component({
  selector: 'app-modulev2',
  templateUrl: './modulev2.component.html',
  styleUrls: ['./modulev2.component.scss'],
  providers: [FilterService, SortService, ReorderService],
  encapsulation: ViewEncapsulation.None
})
export class Modulev2Component extends BaseComponent implements OnInit {

  module: any;
  data: any = [];
  data2: object;
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('treeGrid') treeGrid: TreeGridComponent;
  pageSettings = { pageCount: 20, pageSizes: true, pageSize: 20 };
  fieldsModule: object = { text: 'name', value: 'name' };
  filterSettings = { type: 'Excel' };
  permissionTypeData: object;
  permissionTypeID: any;
  moduleID: any;
  moduleData: object;
  parentID: number;
  level: number;
  parentItem: any;
  languages: any;
  languageID: any;

  fields: object = { text: 'name', value: 'id' };
  public queryCellInfoEvent: EmitType<QueryCellInfoEventArgs> = (args: QueryCellInfoEventArgs) => {
    const data = args.data as any;
    // switch (data.level) {
    //   case 1:
    //     if (args.column.field === 'sequence' || args.column.field === 'language') {
    //       args.colSpan = 2;
    //     }
    //     break;
    //   case 2:
    //     if (args.column.field === 'entity.buildingType.name' || args.column.field === 'entity.kindName') {
    //       args.colSpan = 3;
    //     }
    //     break;
    // }
  }
  constructor(
    private permissionService: PermissionService,
    private alertify: AlertifyService,
    private route: ActivatedRoute,
  ) { super(); }

  ngOnInit() {
    this.PermissionForTreeGrid(this.route);
    this.module = {
    };
    this.getAllLanguage();
  }
  created() {
    this.getModulesAsTreeView();
  }
  onChange(args) {
    this.languageID = args.itemData.id;
    console.log('on change language', args);
  }
  // api
  getAllLanguage() {
    this.permissionService.getAllLanguage().subscribe(res => {
      this.languages = res;
    });
  }
  getModulesAsTreeView() {
    this.permissionService.getModulesAsTreeView().subscribe(res => {
      this.data = res as object[];
      console.log(this.data);
    });
  }

  create() {
    this.permissionService.createModule(this.module).subscribe(() => {
      this.alertify.success('Add module Successfully');
      this.getModulesAsTreeView();
      this.module = {
      };
      this.moduleID = 0;
      this.parentID = null;
      this.level = 0;
      this.parentItem = {};
    });
  }

  update() {
    this.permissionService.updateModule(this.module).subscribe(() => {
      this.alertify.success('Add module Successfully');
      this.getModulesAsTreeView();
      this.module = {
      };
      this.moduleID = 0;
      this.parentID = null;
      this.level = 0;
      this.parentItem = {};
    });
  }
  delete(id) {
    this.alertify.confirm2('Delete module', 'Are you sure you want to delete this module "' + id + '" ?', () => {
      this.permissionService.deleteModule(id).subscribe(() => {
        this.getModulesAsTreeView();
        this.parentID = null;
        this.level = null;
        this.parentItem = {};
        this.alertify.success('The module has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the module');
      });
    }, () => {
      this.parentID = null;
      this.level = null;
      this.parentItem = {};
      this.getModulesAsTreeView();
    });
  }
  // end api

  // grid event
  toolbarClick(args): void {
    switch (args.item.text) {
      /* tslint:disable */
      case 'Excel Export':
        this.grid.excelExport();
        break;
      /* tslint:enable */
      default:
        break;
    }
  }
  rowSelected(args) {
    if (args.isInteracted) {
      const item = args.data;
      this.parentID = +item?.id;
      this.level = Number(item.level) + 1;
      this.moduleID = item?.moduleID;
      this.parentItem = item;
    }
  }
  actionComplete(args) {
  }
  actionBegin(args) {
    if (args.requestType === 'beginEdit') {
      const item = args.rowData;
      this.moduleID = item?.moduleID;
      this.parentID = item?.parentID;
      this.level = item?.level;
    }
    if (args.requestType === 'add' && args.type === "actionBegin") {
      // this.moduleID = args.rowData?.moduleID;
      // this.parentID = args.rowData?.parentID;
      // this.level = args.rowData?.level;
      // args.data.entity.module = this.parentItem.module;
    }
    if (args.requestType === 'save' && args.action === 'add') {
      const item = args.data;
      this.module.id = 0;
      this.module.name = item.name;
      this.module.code = item.code;
      this.module.url = item.url;
      this.module.icon = item.icon;
      this.module.level = item.level || 1;
      this.module.sequence = item.sequence || 0;
      const translation = {
        languageID: this.languageID,
        name: item.name
      };
      this.module.translation = translation;
      this.create();
    }
    if (args.requestType === 'save' && args.action === 'edit') {
      const item = args.data;
      this.module.id = item.id;
      this.module.name = item.name;
      this.module.code = item.code;
      this.module.url = item.url;
      this.module.icon = item.icon;
      this.module.level = this.level;
      this.module.parentID = this.parentID;
      this.module.sequence = item.sequence;
      this.module.moduleID = this.moduleID || null;
      this.update();
    }
    if (args.requestType === 'delete') {
      this.delete(this.parentID);
    }
  }

  // end event
  NO(index) {
    return (this.treeGrid.pageSettings.currentPage - 1) * this.pageSettings.pageSize + Number(index) + 1;
  }
  onChangeModule(args) {
    this.moduleID = args.itemData.id;
  }
  getLang(key: string) {
    const lang = this.languages.filter(x => x.id === key) || [];
    return lang === [] ? "N/A" : lang.name;
  }
}
