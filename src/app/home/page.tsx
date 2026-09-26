import { redirect } from "next/navigation";
import { homeFor, requireUser } from "@/lib/session";

/** Post-login landing: sends each role to its own area. */
export default async function HomeRedirect() {
  const user = await requireUser();
  redirect(homeFor(user.role));
}
