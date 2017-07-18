angular.module('n52.core.base')
    .constant('constants', {
        platformType: {
            stationaryInsitu: 'stationary_insitu',
            mobileInsitu: 'mobile_insitu'
        },
        valueType: {
            quantity: 'quantity',
            quantityProfile: 'quantity-profile'
        }
    });
