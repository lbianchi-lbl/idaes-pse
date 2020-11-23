const REVIEW_STATE = {
  dismissed: "DISMISSED",
  approved: "APPROVED",
};

function selectLatestPerUser(reviews) {
  const latestByUser = {};
  reviews.forEach((r) => {
    // the reviews are in chronological order (earliest to latest)
    // so to get the latest for each user we can use an Object as a map and loop over all reviews
    // at each iteration, a more recent review for that user will replace an earlier one set before it
    latestByUser[r.user.login] = r;
  });
  return Object.values(latestByUser);
}

module.exports = async ({ github, owner, repo, pullNumber }) => {
  const { data: reviews } = await github.pulls.listReviews({
    owner: owner,
    repo: repo,
    pull_number: pullNumber,
  });

  const latestReviews = selectLatestPerUser(reviews);
  console.log(latestReviews);
  const countApproved = latestReviews.filter(
    (r) => r.state === REVIEW_STATE.approved
  ).length;
  console.log(`${countApproved} approving reviews`);

  return countApproved;
};
