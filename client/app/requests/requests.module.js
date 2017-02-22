import { OrderExplorerComponent } from './order-explorer/order-explorer.component.js';
import { OrdersStateFactory } from './orders-state.service.js';
import { ProcessOrderModalComponent } from './process-order-modal/process-order-modal.component.js';
import { ProcessRequestsModalComponent } from './process-requests-modal/process-requests-modal.component.js';
import { RequestExplorerComponent } from './request-explorer/request-explorer.component.js';
import { RequestListComponent } from './request-list/request-list.component.js';
import { RequestWorkflowComponent } from './request-workflow/request-workflow.component.js';
import { RequestsStateFactory } from './requests-state.service.js';
import { SharedModule } from '../shared/shared.module.js';
import { TagsTreeComponent } from './request-workflow/tags-tree.component.js';

export const RequestsModule = angular
  .module('app.requests', [
    SharedModule,
  ])
  .component('processOrderModal', ProcessOrderModalComponent)
  .component('processRequestsModal', ProcessRequestsModalComponent)
  .component('requestExplorer', RequestExplorerComponent)
  .component('orderExplorer', OrderExplorerComponent)
  .component('requestList', RequestListComponent)
  .component('requestWorkflow', RequestWorkflowComponent)
  .factory('OrdersState', OrdersStateFactory)
  .factory('RequestsState', RequestsStateFactory)
  .component('tagsTree', TagsTreeComponent)
  .name;
