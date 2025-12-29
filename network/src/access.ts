export default (initialState: { currentUser?: API.CurrentUser }) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  const canSeeAdmin = !!(initialState && initialState.currentUser);
  return {
    canSeeAdmin,
  };
};
