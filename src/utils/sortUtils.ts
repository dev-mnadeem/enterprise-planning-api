const buildOrderByFn = (sort: any) => {
  const sortArr = sort.split('-');
  const fieldName = sortArr.length > 1 ? sortArr[1] : sortArr[0];
  const orderBy: { fieldName: string; order: 'ASC' | 'DESC' } = {
    fieldName,
    order: sortArr.length > 1 ? 'DESC' : 'ASC',
  };
  return orderBy;
};

export { buildOrderByFn };
