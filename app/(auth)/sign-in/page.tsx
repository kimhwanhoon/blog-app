import { SignInForm } from "./sign-in-form";

export default async function SignInPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await props.searchParams;
  return <SignInForm redirectTo={redirect} />;
}
