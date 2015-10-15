angular.module('linkState', ['ngMaterial'])
.controller('linkStateController', function ($scope, $mdDialog) {
  // create an array with nodes
  var nodes = new vis.DataSet([
      {id: 'A', label: 'A'},
      {id: 'B', label: 'B'}
  ]);
  $scope.nodes = nodes.get();
  $scope.rows = [];

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  nodes.on('*', function () {
    console.log("Something Happenned")
    $scope.safeApply(function () {
      $scope.nodes = nodes.get();
    });
  });

  // create an array with edges
  var edges = new vis.DataSet([
      {from: 'A', to: 'B', value: 1, label:"1"}
  ]);

  // create a network
  var container = document.getElementById('mynetwork');

  // provide the data in the vis format
  var data = {
      nodes: nodes,
      edges: edges
  };

  // initialize your network!
  var network = new vis.Network(container, data, options);

  var options = {
    manipulation: {
      enabled: true,
      initiallyActive: true,
      addNode: addNode,
      addEdge: addEdge,
      editNode: undefined,
      editEdge: false,
      deleteNode: true,
      deleteEdge: true
    }
  }

  network.setOptions(options);

  function addNode(nodeData, callback) {
    $mdDialog.show({
      controller: AddNodeDialogController,
      templateUrl: 'partials/addNode.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true
    })
    .then(function(name) {
      nodeData.label = name;
      nodeData.id = name;
      callback(nodeData);
    }, function(answer) {
      callback(null);
    });
  }

  function AddNodeDialogController($scope, $mdDialog) {
    $scope.node = {
      name: ""
    };
    $scope.errorMessage = false;

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.create = function() {
      if (!nodes.get($scope.node.name)) {     
        $mdDialog.hide($scope.node.name); 
      } else {
        $scope.errorMessage = true;
      }
    };
  }

  function addEdge(edgeData, callback) {
    if (edgeData.to === edgeData.from) {
      return callback(null);
    }
    if (network.getConnectedNodes(edgeData.to).indexOf(edgeData.from) >= 0) {
      return callback(null);
    }
    $mdDialog.show({
      controller: AddEdgeDialogController,
      templateUrl: 'partials/addEdge.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true
    })
    .then(function(weight) {
      edgeData.value = weight;
      edgeData.label = "" + weight;
      callback(edgeData);
    }, function(answer) {
      callback(null);
    });
  }

  function AddEdgeDialogController($scope, $mdDialog) {
    $scope.edge = {
      weight: ""
    };
    $scope.errorMessage = false;

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.create = function() {     
      $mdDialog.hide($scope.edge.weight);
    };
  }

  $scope.resetData = function () {
    nodes = new vis.DataSet([{id: 'A', label: 'A'},{id: 'B', label: 'B'}]);
    edges = new vis.DataSet([{from: 'A', to: 'B', value: 1, label:"1"}]);
    network.setData({nodes:nodes, edges:edges});
    $scope.nodes = nodes.get();
    $scope.initialNode = "";
    $scope.rows = [];
    D = {};
    p = {};
    N = [];
    nodes.on('*', function () {
      console.log("Something Happenned")
      $scope.safeApply(function () {
        $scope.nodes = nodes.get();
      });
    });
    if (newNetwork) {
      newNetwork.destroy();
    }
  };

  var D = {};
  var p = {};
  var N = [];

  $scope.submit = function () {
    $scope.rows = [];
    D = {};
    p = {};
    N = [];
    if (newNetwork) {
      newNetwork.destroy();
    }
    $scope.rows.push(initialRow());
    $scope.linkState($scope.initialNode);
    $scope.generateNewGraph();
  }

  var newNodes = new vis.DataSet();
  
  // create an array with edges
  var newEdges = new vis.DataSet();
  var newNetwork;

  function drawPath(node) {
    if (newNodes.get(node)) {
      return;
    }
    newNodes.add({id: node, label: node})
    newEdges.add({from: node, to: p[node]})
    drawPath(p[node]);
  }

  $scope.generateNewGraph = function () {
    for (var prevNode in p) {
      if (p.hasOwnProperty(prevNode)) {
        drawPath(prevNode);
      }
    }

    console.log(newNodes.get());
    console.log(newEdges.get());

    // create a network
    var container = document.getElementById('networkresult');

    // provide the data in the vis format
    var data = {
        nodes: newNodes,
        edges: newEdges
    };

    // initialize your network!
    newNetwork = new vis.Network(container, data, {});
  }

  function formatRow() {
    var row = [];
    row[0] = $scope.rows.length-1;
    row[1] = N.join(", ");
    for (var i = 0; i < $scope.nodes.length; i++) {
      if ($scope.nodes[i].id === $scope.initialNode) {
        continue;
      }
      var str = D[$scope.nodes[i].id]? D[$scope.nodes[i].id]+", "+p[$scope.nodes[i].id] : "Infinite";  
      row.push(str);
    };
    return row;
  }

  function initialRow() {
    var row = [];
    row[0] = "Step";
    row[1] = "N Beginning";
    for (var i = 0; i < $scope.nodes.length; i++) {
      if ($scope.nodes[i].id === $scope.initialNode) {
        continue;
      }
      row.push("D("+$scope.nodes[i].id+"), p("+$scope.nodes[i].id+")");
    };
    return row;
  }

  function nodeInEdges(node, connectedEdges) {
    for (var i = 0; i < connectedEdges.length; i++) {
      var edge = edges.get(connectedEdges[i]);
      if (edge.to === node || edge.from === node) {
        return edge.value;
      }
    };
    return -1;
  }

  $scope.linkState = function (node) {
    console.log("Node: ",node);
    var connectedEdges = network.getConnectedEdges(node);
    console.log(connectedEdges);
    N.push(node);
    for (var i = 0; i < $scope.nodes.length; i++) {
      if ($scope.nodes[i].id === node || $scope.nodes[i].id === $scope.initialNode || N.indexOf($scope.nodes[i].id) !== -1) {
        continue;
      } 
      var weight = parseInt(nodeInEdges($scope.nodes[i].id, connectedEdges));
      console.log($scope.nodes[i].id, weight);
      if (weight !== -1) {
        if (D[$scope.nodes[i].id]) {
          if ((D[node]+weight) < D[$scope.nodes[i].id]) {
            D[$scope.nodes[i].id] = D[node]+weight;
            p[$scope.nodes[i].id] = node;
          }  
        } else {
          if (D[node]) {
            D[$scope.nodes[i].id] = D[node]+weight;
            p[$scope.nodes[i].id] = node;
          } else {
            D[$scope.nodes[i].id] = weight;
            p[$scope.nodes[i].id] = node;
          }
        }
      }
    };
    console.log(D, p, N);
    $scope.rows.push(formatRow());
    var min = getMinEdge(node, connectedEdges);
    while(min) {
      $scope.linkState(min);
      min = getMinEdge(node, connectedEdges);
    }
  }

  function getMinEdge(node, connectedEdges) {
    var min;;
    var minNode;
    for (var i = 0; i < connectedEdges.length; i++) {
      var edge = edges.get(connectedEdges[i]);
      var toNode = (edge.to === node)? edge.from : edge.to;
      if (N.indexOf(toNode) !== -1) {
        continue;
      } else {
        if (!min) {
          min = edge.value;
          minNode = toNode;
        } else {
          if (edge.value < min) {
            min = edge.value;
            minNode = toNode;
          }
        }
      }
    };
    return minNode;
  }
});