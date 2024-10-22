import VerifyMagicLink from "../../_components/verify-magic-link";

const MagicLinkVerification = async (
  props: {
    params: Promise<{ id: string }>;
  }
) => {
  const params = await props.params;
  return <VerifyMagicLink id={params.id} />;
};

export default MagicLinkVerification;
