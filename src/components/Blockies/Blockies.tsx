import React from "react";
import blockies from "ethereum-blockies";

const Avatar = ({ address, width }: { address: string; width: number }) => {
  const blockie = blockies.create({
    seed: address,
    size: 8,
    scale: 5,
  });

  return (
    <img
      src={blockie.toDataURL()}
      alt="Wallet avatar"
      className="rounded-full object-cover"
      style={{ width, height: width }}
    />
  );
};

export default Avatar;
