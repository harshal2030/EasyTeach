import React from 'react';
import {PricingCard} from 'react-native-elements';

export const Pricing = () => {
  return (
    <>
      <PricingCard
        title="Free"
        price="Rs. 0"
        info={['100 students', '5 Tests', 'Core Features']}
        button={{title: 'GET STARTED'}}
      />

      <PricingCard
        title="Standard"
        price="Rs. 100 / month"
        info={['1000 students', 'unlimited tests', '20 GB of Modules']}
        button={{title: 'GET STARTED'}}
      />
    </>
  );
};
