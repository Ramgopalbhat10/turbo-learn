import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  friend: Record<string, string>[];
};

export const loader: LoaderFunction = async () => {
  let response;
  try {
    const data = await fetch(process.env.HASURA_PROJECT_ENDPOINT as string, {
      method: "POST",
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
      },
      body: JSON.stringify({
        query: `query {
          friend {
            name
          }
        }`,
      }),
    });
    response = await data.json();
  } catch (error) {
    throw new Error("Something went wrong while calling API");
  }
  return response.data;
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
