import React, {useEffect, useRef} from 'react';
import axios from 'axios';

type Props = {
  url: string;
  trackerUrl: string;
  token: string;
  start: Date;
};

const Video = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startRef = useRef<Date>(props.start);
  const prevUrl = useRef(props.url);
  const trackerUrl = useRef(props.trackerUrl);

  const track = () => {
    const stop = new Date();
    axios
      .post(
        trackerUrl.current,
        {
          start: startRef.current,
          stop,
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .catch(() => null);
  };

  window.onbeforeunload = () => {
    track();
  };

  const beforeUnload = (e: BeforeUnloadEvent) => {
    track();
    e.preventDefault();
    const msg = null;
    e.returnValue = msg;
    return msg;
  };

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnload);

    if (prevUrl.current === props.url) {
      return;
    }

    if (videoRef.current) {
      track();
      videoRef.current.load();
    }

    startRef.current = props.start;
    prevUrl.current = props.url;
    trackerUrl.current = props.trackerUrl;

    return () => {
      console.log('unmounted');
      track();
      window.removeEventListener('beforeunload', beforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.url]);

  return (
    <video
      ref={videoRef}
      width="100%"
      height="500"
      controls
      onContextMenu={(e) => e.preventDefault()}
      controlsList="nodownload">
      <source src={props.url} />
    </video>
  );
};

export {Video};
