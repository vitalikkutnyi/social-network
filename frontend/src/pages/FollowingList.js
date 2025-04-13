import React from "react";
import { Helmet } from "react-helmet";
import FollowList from "../components/FollowList";

const FollowingList = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <FollowList type="following" />
    </>
  );
};

export default FollowingList;
