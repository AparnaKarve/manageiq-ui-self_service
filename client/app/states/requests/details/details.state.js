(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'requests.details': {
        url: '/:requestId',
        templateUrl: 'app/states/requests/details/details.html',
        controller: RequestDetailsController,
        controllerAs: 'vm',
        title: N_('Request Details'),
        resolve: {
          request: resolveRequest,
        },
      },
    };
  }

  /** @ngInject */
  function resolveRequest($stateParams, CollectionsApi) {
    var options = {attributes: ['provision_dialog', 'picture', 'picture.image_href', 'workflow']};

    return CollectionsApi.get('requests', $stateParams.requestId, options);
  }

  /** @ngInject */
  function RequestDetailsController(request) {
    var vm = this;

    vm.title = request.description;
    vm.request = request;
  }
})();
