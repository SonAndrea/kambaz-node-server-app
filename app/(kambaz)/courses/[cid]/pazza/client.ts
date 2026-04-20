import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const PAZZA_API = `${HTTP_SERVER}/api/pazza`;
const USERS_API = `${HTTP_SERVER}/api/users`;

export const getCurrentUser = async () => {
  try {
    const response = await axiosWithCredentials.get(`${USERS_API}/profile`);
    return response.data;
  } catch {
    return null;
  }
};

export const findPostsForCourse = async (courseId: string) => {
  const response = await axiosWithCredentials.get(`${PAZZA_API}/${courseId}/posts`);
  return response.data;
};

export const getCourseStats = async (cid: string) => {
  const response = await axiosWithCredentials.get(`${PAZZA_API}/${cid}/stats`);
  return response.data;
};


export const findFoldersForCourse = async (cid: string) => {
  const response = await axiosWithCredentials.get(`${PAZZA_API}/${cid}/folders`);
  return response.data;
};

export const createFolder = async (cid: string, name: string) => {
  const response = await axiosWithCredentials.post(`${PAZZA_API}/${cid}/folders`, { name });
  return response.data;
};

export const deleteFolders = async (folderIds: string[]) => {
  const response = await axiosWithCredentials.delete(`${PAZZA_API}/folders`, {
    data: { folderIds },
  });
  return response.data;
};

export const createPost = async (
  cid: string,
  post: {
    type: "QUESTION" | "NOTE" | "POLL";
    postTo: "ENTIRE_CLASS" | "INDIVIDUAL";
    folders: string[];
    summary: string;
    details: string;
  }
) => {
  const response = await axiosWithCredentials.post(`${PAZZA_API}/${cid}/posts`, post);
  return response.data;
};

export const getPostDetails = async (postId: string) => {
  const res = await axiosWithCredentials.get(`${PAZZA_API}/posts/${postId}/details`);
  return res.data;
};

export const deletePost = async (postId: string) => {
  const response = await axiosWithCredentials.delete(`${PAZZA_API}/posts/${postId}`);
  return response.data;
};


export const createAnswer = async (postId: string, content: string) => {
  const response = await axiosWithCredentials.post(`${PAZZA_API}/posts/${postId}/answers`, { content });
  return response.data;
};

export const deleteAnswer = async (answerId: string) => {
  const response = await axiosWithCredentials.delete(`${PAZZA_API}/answers/${answerId}`);
  return response.data;
};


export const createFollowup = async (postId: string, content: string) => {
  const response = await axiosWithCredentials.post(`${PAZZA_API}/posts/${postId}/followups`, { content });
  return response.data;
};

export const deleteFollowup = async (followupId: string) => {
  const response = await axiosWithCredentials.delete(`${PAZZA_API}/followups/${followupId}`);
  return response.data;
};

export const toggleFollowupResolved = async (followupId: string) => {
  const response = await axiosWithCredentials.put(`${PAZZA_API}/followups/${followupId}/resolve`);
  return response.data;
};

export const addReply = async (followupId: string, content: string) => {
  const response = await axiosWithCredentials.post(`${PAZZA_API}/followups/${followupId}/replies`, { content });
  return response.data;
};

export const deleteReply = async (followupId: string, replyId: string) => {
  const response = await axiosWithCredentials.delete(`${PAZZA_API}/followups/${followupId}/replies/${replyId}`);
  return response.data;
};

export const updateFolder = async (folderId: string, name: string) => {
  const response = await axiosWithCredentials.put(
    `${PAZZA_API}/folders/${folderId}`,
    { name }
  );
  return response.data;
};