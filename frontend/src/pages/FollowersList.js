import React from "react";
import { Helmet } from "react-helmet";
import FollowList from "../components/FollowList";

const FollowersList = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <FollowList type="followers" />
    </>
  );
};

export default FollowersList;
