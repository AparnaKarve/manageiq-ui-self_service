/** @ngInject */
export function RequestsExplorerState(routerHelper) {
  routerHelper.configureStates(getStates());
}

function getStates() {
  return {
    'requests.explorer': {
      url: '',
      templateUrl: 'app/states/requests/explorer/explorer.html',
      controller: StateController,
      controllerAs: 'vm',
      title: N_('Requests'),
    },
  };
}

/** @ngInject */
function StateController(RequestsState) {
  var vm = this;

  activate();

  function activate() {
    if (angular.isUndefined(RequestsState.filterApplied)) {
      RequestsState.setFilters([{ 'id': 'approval_state', 'title': __('Request Status'), 'value': __('pending_approval') }]);
      RequestsState.filterApplied = true;
    }
  }
}
