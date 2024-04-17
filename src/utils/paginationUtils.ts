const buildPagination = (pageNumber: string | undefined, pageSize: string | undefined) => {
  const pageNo = pageNumber ? parseInt(pageNumber, 10) : 1;
  const take = pageSize ? parseInt(pageSize, 10) : 10;
  const skip = (pageNo - 1) * take;
  return { take, skip, pageNo };
};

export { buildPagination };
