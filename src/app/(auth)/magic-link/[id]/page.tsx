import VerifyMagicLink from "../../_components/verify-magic-link";

const MagicLinkVerification = async ({
  params,
}: {
  params: { id: string };
}) => {
  return <VerifyMagicLink id={params.id} />;
};

export default MagicLinkVerification;
