import React, {useEffect, useRef} from 'react';
import axios from 'axios';

type Props = {
  url: string;
  trackerUrl: string;
  token: string;
};

const Video = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevUrl = useRef(props.url);
  const start = new Date();

  useEffect(() => {
    if (prevUrl.current === props.url) {
      return;
    }

    if (videoRef.current) {
      videoRef.current.load();
    }

    prevUrl.current = props.url;

    return () => track();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.url]);

  const track = () => {
    axios
      .post(
        props.trackerUrl,
        {
          start: start,
          stop: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        },
      )
      .catch(() => null);
  };

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
