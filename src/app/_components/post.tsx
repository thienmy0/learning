"use client";

import { useState } from "react";
import React from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../server/api/root";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent note: {latestPost.name}</p>
      ) : (
        <p>You have no notes yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Message"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

type Post = inferRouterOutputs<AppRouter>["post"]["getAll"][number];

const PostList = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center rounded-xl bg-white/10 p-4 text-white">
      <h1 className="text-2xl font-bold">Notes</h1>
      <ul>
        {posts?.map((post: Post) => (
          <li key={post.id}>
            <h2 className="text-xl">{post.name}</h2>
            <p className="text-sm text-gray-400">
              Created At: {new Date(Number(post.createdAt)).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostList;
