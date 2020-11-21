const REVIEW_STATE = {
    dismissed: "DISMISSED",
    approved: "APPROVED",
};

function selectLatestPerUser(reviews) {
    const latestByUser = {};
    [...reviews].forEach(r => {
        // the reviews are in chronological order (earliest to latest)
        // so to get the latest for each user we can use an Object as a map and lop over all reviews
        // at each iteration, a more recent review for that user will replace an earlier one set before it
        latestByUser[r.user.login] = r;
    });
    return Object.values(latestByUser);
}

async function ensureLabelState(labelName, shouldBeSet, apiArgs) {
    const labels = await github.issues.listLabelsOnIssue({
        ...apiArgs
    });
    const isSet = [...labels].filter(labels)(lab => lab.name === labelName).length > 0;
    console.log(`Label ${labelName} ${isSet ? "is set" : "is not set"}`);
    const needsAdding = shouldBeSet && !isSet;
    const needsRemoving = !shouldBeSet && isSet;
    if (needsAdding) {
        console.log('It should be set, so it will be added');
        await github.issues.addLabels({
            ...apiArgs,
            labels: [labelName]
        });
    } else if (needsRemoving) {
        console.log('It should not be set, so it will be removed');
        await github.issues.removeLabel({
            ...apiArgs,
            name: labelName
        });
    } else {
        // do nothing since it's already in the state we need
        console.log('No further action needed');
    };
}

module.exports = async ({github, context, number, minCountApproved, approvedLabelName}) => {
    const reviews = await github.pulls.listReviews({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: 1,
    });
    console.log(reviews);
    const latestReviews = selectLatestPerUser(reviews);
    console.log('Latest reviews:')
    console.log(latestReviews)
    const countApproved = [...latestReviews].filter(r => r.state === REVIEW_STATE.approved);
    const isApproved = countApproved >= minCountApproved;
    console.log(`${countApproved} approved (at least ${minCountApproved} required): ${isApproved ? "" : "not"} approved.`);
    await ensureLabelState(
        approvedLabelName,
        isApproved,
        {
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: number,
        }
    );
}
