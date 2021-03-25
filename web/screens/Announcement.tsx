import React from 'react';
import {toast} from 'react-toastify';

import Announce from '../../shared/screens/Announcement';

const Announcement = () => {
  return (
    <Announce
      onJoinPress={() => console.log('join pressed')} // TODO: create join class screen and route it
      onLeftTopPress={() => null} // TODO: Need to think about it
      onSendError={() =>
        toast.error(
          'Unable to send message at the moment. Please try again later',
        )
      }
    />
  );
};

export default Announcement;
