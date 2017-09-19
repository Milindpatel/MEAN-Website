angular.module('meanhotel').controller('LoginController', LoginController);

function LoginController($http, $location, $window, AuthFactory){
    var vm = this;

    vm.isLoggedIn = function(){
        if(AuthFactory.isLoggedIn){
            return true;
        }else{
            return false;
        }
    };

    vm.login = function(){

    }

    vm.logout = function(){

    }

    vm.isActiveTab = function(url){
        var currentPath = $location.path().split('/')[1];
        return(url === currentPath ? 'active' : '' );
    }
}