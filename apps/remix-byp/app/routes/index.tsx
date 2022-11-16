import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { client } from "~/utils/urql-client";
import { GetFriends, GetFriendsQuery } from "../../graphql/generated/types";

type LoaderData = {
  friend: GetFriendsQuery["friend"];
};

export const loader: LoaderFunction = async () => {
  try {
    const { data } = await client
      .query<GetFriendsQuery>(GetFriends, {})
      .toPromise();
    return data;
  } catch (error) {
    throw new Error("Something went wrong while calling API");
  }
};

export default function Index() {
  const { friend: friends } = useLoaderData<LoaderData>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome 👋🏻</h1>
      {friends.map((friend) => (
        <p>{friend.name}</p>
      ))}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>App Error - {error.message}</div>;
}
