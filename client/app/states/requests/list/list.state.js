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
      'requests.list': {
        url: '',
        templateUrl: 'app/states/requests/list/list.html',
        controller: StateController,
        controllerAs: 'vm',
        title: N_('Request List'),
        resolve: {
          requests: resolveRequests,
          orders: resolveOrders,
        }
      }
    };
  }

  /** @ngInject */
  function resolveRequests(CollectionsApi) {
    var attributes = ['picture', 'picture.image_href', 'approval_state', 'created_on', 'description'];
    var filterValues = ['type=ServiceReconfigureRequest', 'or type=ServiceTemplateProvisionRequest'];
    var options = {expand: 'resources', attributes: attributes, filter: filterValues};

    return CollectionsApi.query('requests', options);
  }

  /** @ngInject */
  function resolveOrders(CollectionsApi) {
    return CollectionsApi.query('service_orders', {
      expand: ['resources', 'service_requests'],
      filter: ['state=ordered'],
    });
  }

  /** @ngInject */
  function StateController($state, requests, orders, RequestsState, OrdersState, $filter, $rootScope, lodash) {
    var vm = this;

    vm.title = __('Request List');
    vm.requests = requests.resources;
    vm.requestsList = angular.copy(vm.requests);

    vm.orders = orders.resources;
    vm.orderListConfig = {
      showSelectBox: false,
      selectionMatchProp: 'id',
      onClick: handleOrderClick,
    };

    if (angular.isDefined($rootScope.notifications) && $rootScope.notifications.data.length > 0) {
      $rootScope.notifications.data.splice(0, $rootScope.notifications.data.length);
    }

    vm.listConfig = {
      selectItems: false,
      showSelectBox: false,
      selectionMatchProp: 'id',
      onClick: handleRequestClick,
    };

    vm.toolbarConfig = {
      filterConfig: {
        fields: [
           {
            id: 'description',
            title:  __('Description'),
            placeholder: __('Filter by Description'),
            filterType: 'text'
          },
          {
            id: 'request_id',
            title: __('Request ID'),
            placeholder: __('Filter by ID'),
            filterType: 'text'
          },
          {
            id: 'request_date',
            title: __('Request Date'),
            placeholder: __('Filter by Request Date'),
            filterType: 'text'
          },
          {
            id: 'approval_state',
            title: __('Request Status'),
            placeholder: __('Filter by Status'),
            filterType: 'select',
            filterValues: [__('Pending'), __('Denied'), __('Approved')]
          }
        ],
        resultsCount: vm.requestsList.length,
        appliedFilters: RequestsState.filterApplied ? RequestsState.getFilters() : [],
        onFilterChange: filterChange
      },
      sortConfig: {
        fields: [
          {
            id: 'description',
            title: __('Description'),
            sortType: 'alpha'
          },
          {
            id: 'id',
            title: __('Request ID'),
            sortType: 'numeric'
          },
          {
            id: 'requested',
            title: __('Request Date'),
            sortType: 'numeric'
          },
          {
            id: 'status',
            title: __('Request Status'),
            sortType: 'alpha'
          }
        ],
        onSortChange: sortChange,
        isAscending: RequestsState.getSort().isAscending,
        currentField: RequestsState.getSort().currentField
      }
    };

    if (RequestsState.filterApplied) {
      /* Apply the filtering to the data list */
      filterChange(RequestsState.getFilters());
      RequestsState.filterApplied = false;
    } else {
      applyFilters();
    }

    function handleRequestClick(item, _e) {
      $state.go('requests.details', { requestId: item.id });
    }

    function handleOrderClick(item, _e) {
      $state.go('requests.order_details', { serviceOrderId: item.id });
    }

    function sortChange(sortId, direction) {
      vm.requestsList.sort(compareFn);

      /* Keep track of the current sorting state */
      RequestsState.setSort(sortId, vm.toolbarConfig.sortConfig.isAscending);
    }

    function compareFn(item1, item2) {
      var compValue = 0;
      if (vm.toolbarConfig.sortConfig.currentField.id === 'description') {
        compValue = item1.description.localeCompare(item2.description);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'id') {
        compValue = item1.id - item2.id;
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'requested') {
        compValue = new Date(item1.created_on) - new Date(item2.created_on);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'status') {
        compValue = item1.approval_state.localeCompare(item2.approval_state);
      }

      if (!vm.toolbarConfig.sortConfig.isAscending) {
        compValue = compValue * -1;
      }

      return compValue;
    }

    function filterChange(filters) {
      applyFilters(filters);
      vm.toolbarConfig.filterConfig.resultsCount = vm.requestsList.length;
    }

    function applyFilters(filters) {
      vm.requestsList = [];
      if (filters && filters.length > 0) {
        angular.forEach(vm.requests, filterChecker);
      } else {
        vm.requestsList = vm.requests;
      }

      /* Keep track of the current filtering state */
      RequestsState.setFilters(filters);

      /* Make sure sorting direction is maintained */
      sortChange(RequestsState.getSort().currentField, RequestsState.getSort().isAscending);

      function filterChecker(item) {
        if (matchesFilters(item, filters)) {
          vm.requestsList.push(item);
        }
      }
    }

    function matchesFilters(item, filters) {
      var matches = true;
      angular.forEach(filters, filterMatcher);

      function filterMatcher(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;

          return false;
        }
      }

      return matches;
    }

    function matchesFilter(item, filter) {
      if ('description' === filter.id) {
        return item.description.toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if (filter.id === 'approval_state') {
        var value;
        if (lodash.lastIndexOf([__('Pending'), 'Pending'], filter.value) > -1) {
          value = "pending_approval";
        } else if (lodash.lastIndexOf([__('Denied'), 'Denied'], filter.value) > -1) {
          value = "denied";
        } else if (lodash.lastIndexOf([__('Approved'), 'Approved'], filter.value) > -1) {
          value = "approved";
        }

        return item.approval_state === value;
      } else if (filter.id === 'request_id') {
        return String(item.id).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if ('request_date' === filter.id) {
        return $filter('date')(item.created_on).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      }

      return false;
    }
  }
})();
