import { OrderExplorerComponent } from './order-explorer/order-explorer.component.js';
import { OrdersStateFactory } from './orders-state.service.js';
import { ProcessOrderModalComponent } from './process-order-modal/process-order-modal.component.js';
import { ProcessRequestsModalComponent } from './process-requests-modal/process-requests-modal.component.js';
import { RequestExplorerComponent } from './request-explorer/request-explorer.component.js';
import { RequestListComponent } from './request-list/request-list.component.js';
import { RequestsStateFactory } from './requests-state.service.js';
<<<<<<< cf8c3407d45dd9702204716ac980824ed36880b4
import { SharedModule } from '../shared/shared.module.js';
=======
import { RequestWorkflowComponent } from './request-workflow/request-workflow.component.js';
import { SharedModule } from '../shared/shared.module.js';
import { TagsTreeComponent } from './request-workflow/tags-tree.component.js';
>>>>>>> Changes per PR #450

export const RequestsModule = angular
  .module('app.requests', [
    SharedModule,
  ])
  .component('processOrderModal', ProcessOrderModalComponent)
  .component('processRequestsModal', ProcessRequestsModalComponent)
  .component('requestExplorer', RequestExplorerComponent)
  .component('orderExplorer', OrderExplorerComponent)
  .component('requestList', RequestListComponent)
<<<<<<< cf8c3407d45dd9702204716ac980824ed36880b4
=======
  .component('requestWorkflow', RequestWorkflowComponent)
  .component('tagsTree', TagsTreeComponent)
>>>>>>> Changes per PR #450
  .factory('OrdersState', OrdersStateFactory)
  .factory('RequestsState', RequestsStateFactory)
  .name;
