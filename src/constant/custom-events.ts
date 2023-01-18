export enum EventNames {

    SET_TEST_MAINTAINER = 'test:maintainer:set',
    ATTACH_TEST_LABELS = 'test:labels:attach',
    ATTACH_TEST_ARTIFACT_REFERENCES = 'test:artifacts:attach-references',
    REVERT_TEST_REGISTRATION = 'test:registration:revert',

    UPLOAD_TEST_ARTIFACT_BUFFER = 'test:artifact:buffer:upload',
    SAVE_TEST_SCREENSHOT_BUFFER = 'test:screenshot:buffer:save',

    ATTACH_TEST_RUN_LABELS = 'test-run:labels:attach',
    ATTACH_TEST_RUN_ARTIFACT_REFERENCES = 'test-run:artifacts:attach-references'

}
