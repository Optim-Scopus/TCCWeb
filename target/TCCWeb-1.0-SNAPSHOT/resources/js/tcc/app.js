/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var parameters = {
    groupSize: 1,
    groceriesSize: 2,
    task: 3,
    issue: 0,
    specialDate: 0,
    x: 450,
    y: 450
};

(function () {
'use strict';

var getTimeInSec = function() {
    var d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

angular.module('Optimizer', [])
.controller('OptimizerController', OptimizerController)
.service('OptimizerService', OptimizerService)
/*.directive('places', placesDirective)*/
.constant('ApiBasePath', "http://localhost:8080/Optimizer-web/OptimizerServlet");

OptimizerController.$inject = ['OptimizerService'];
function OptimizerController(OptimizerService) {
    var optim = this;

    optim.restaurants = {
        data:[],
        unselected: [],
        selected:[]
    };
    optim.banks = {
        data:[],
        unselected: [],
        selected:[]
    };
    optim.groceries = {
        data:[],
        unselected: [],
        selected:[]
    };
    
    optim.optimized = [];

    /*optim.getAll = function() {
        var promise = OptimizerService.getAllPlaces();
        promise.then(function (response) {
            optim.places = response;
        })
        .catch(function (error) {
            console.log(error);
        })
    }*/
    var promise = OptimizerService.getAllPlaces();
    promise.then(function (response) {
        response.forEach(function(place, placeIndex){
            if (place.category === 3) {
                optim.banks.data.push(place);
                optim.banks.unselected.push(place);
            } else if (place.category === 4) {
                optim.groceries.data.push(place);
                optim.groceries.unselected.push(place);
            } else {
                optim.restaurants.data.push(place);
                optim.restaurants.unselected.push(place);
            }
        })
    })
    .catch(function (error) {
        console.log(error);
    })
    
    optim.select = function (index, type) {
        var selected = optim[type].unselected.splice(index, 1)[0];
        optim[type].selected.push(selected);
    }
    
    optim.unselect = function (index, type) {
        var selected = optim[type].selected.splice(index, 1)[0];
        optim[type].unselected.push(selected);
    }
    
    optim.selectAll = function () {
        optim.restaurants.selected = optim.restaurants.data.slice();
        optim.restaurants.unselected = [];
        optim.banks.selected = optim.banks.data.slice();
        optim.banks.unselected = [];
        optim.groceries.selected = optim.groceries.data.slice();
        optim.groceries.unselected = [];
    }
    
    optim.unselectAll = function () {
        optim.restaurants.unselected = optim.restaurants.data.slice();
        optim.restaurants.selected = [];
        optim.banks.unselected = optim.banks.data.slice();
        optim.banks.selected = [];
        optim.groceries.unselected = optim.groceries.data.slice();
        optim.groceries.selected = [];
    }
    
    optim.sendReq = function () {
        optim.clearOptimized();
        console.log(optim.getDataToSend());
        let reqPromise = OptimizerService.optimize(optim.getDataToSend());
        reqPromise.then(function(response){
            for (var i = 0; i < response.length; i++) {
                optim.optimized.push(optim.getEstabById(response[i]));
            }
            console.log(optim.optimized);
        })
    }
    
    optim.getDataToSend = function() {
        console.log("parameters: ");
        console.log(parameters);
        let listOfCategoriesOfIds = [
            getIdsForArray(optim.restaurants.selected),
            getIdsForArray(optim.banks.selected),
            getIdsForArray(optim.groceries.selected)
        ]
        let now = getTimeInSec();
        
        return {option: "Optimize",
            groupSize: parameters.groupSize,
            groceriesSize: parameters.groceriesSize,
            task: parameters.task,
            issue: parameters.issue,
            specialDate: parameters.specialDate,
            timeArrival: now,
            x: parameters.x, y: parameters.y,
            listOfCategoriesOfIds: listOfCategoriesOfIds
        }
    }
    
    optim.getEstabById = function(id) {
        if (id < 99) {
            return searchArrayForId(optim.restaurants.data, id);
        }
        else if (id < 999) {
            return searchArrayForId(optim.banks.data, id);
        }
        else if (id < 9999) {
            return searchArrayForId(optim.groceries.data, id);
        }
    }
    
    optim.clearOptimized = function() {
        optim.optimized = [];
    }
    
}

var searchArrayForId = function(array, id) {
    for (var index = 0; index < array.length; index++) {
        let item = array[index];
        if (item.id === id) {
            return item;
        }
    }
}

var getIdsForArray = function(array) {
        let returnArr = [];
        array.forEach(function(item, index){
            returnArr.push(item.id);
        })
        return returnArr;
    }

OptimizerService.$inject = ['$http', 'ApiBasePath'];
function OptimizerService($http, ApiBasePath) {
    var service = this;

    service.getAllPlaces = function () {
        var response = $http({
            method: "GET",
            url: (ApiBasePath),
            params: {
                option: "Places"
            }
        }).then (function (result) {
            let returnList = [];
            returnList = result.data;
            console.log(returnList);

            return returnList;
          });

          return response;
    };
    
    service.optimize = function(dataToSend) {
        var response = $http({
            method: "POST",
            url: (ApiBasePath),
            headers: {
              'Content-Type': 'application/json'
            },
            data: dataToSend
        }).then (function (result) {
            let returnList = [];
            returnList = result.data;
            console.log(returnList);

            return returnList;
          });
        
        return response;
    }
}
}) ();