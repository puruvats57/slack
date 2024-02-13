const express = require('express');
const orgController = require("./org.controller");
const verifyJWT = require("../../middlewares/auth.middleware.js");
const router = express.Router();
router.use(verifyJWT);

router.post(
    "/createOrganization",
    orgController.createOrganization
);
router.post(
    "/addPeople",
    orgController.addPeople
);
router.post(
    "/orgJoined",
    orgController.orgJoined
);
router.get(
    "/organizations",
    orgController.organizations
);
router.post(
    "/getOrg",
    orgController.getOrg
);
router.post(
    "/fetchDirectMsgs",
    orgController.fetchDirectMsgs
);
router.delete(
    "/deleteMsgs",
    orgController.deleteMsgs
);

router.post(
    "/deleteChat",
    orgController.deleteChat
);
router.post(
    "/getHomeMembersAndGroups",
    orgController.getHomeMembersAndGroups
);
router.get(
    "/getDisconnectMsgs",
    orgController.getDisconnectMsgs
);
router.post(
    "/searchOrgMembers",
    orgController.searchOrgMembers
);
router.post(
    "/CreateGroup",
    orgController.CreateGroup
);
router.post(
    "/getYourGroups",
    orgController.getYourGroups
);
router.post(
    "/getGrpMsgs",
    orgController.getGrpMsgs
);
router.get(
    "/getGrpMsgsCount",
    orgController.getGrpMsgsCount
);

router.post(
    "/deleteChatForGrp",
    orgController.deleteChatForGrp
);

module.exports = router;
