import { emitterCommands } from "./constants";

export const reporterEmitter = {
  setMaintainer: (maintainer) => {
    (process.emit as Function)(emitterCommands.SET_MAINTAINER, maintainer);
  },
  setRunLabels: (labels) => {
    (process.emit as Function)(emitterCommands.SET_RUN_LABELS, labels);
  },
  setTestLabels: (labels) => {
    (process.emit as Function)(emitterCommands.SET_TEST_LABELS, labels);
  },
  setRunTcmOptions: (options) => {
    (process.emit as Function)(emitterCommands.SET_RUN_TCM_OPTIONS, options);
  },
  setTestTcmOptions: (options) => {
    (process.emit as Function)(emitterCommands.SET_TEST_TCM_OPTIONS, options);
  },
  attachToTestRun: (attachments) => {
    (process.emit as Function)(emitterCommands.ATTACH_TO_TEST_RUN, attachments);
  },
  attachReferenceToTestRun: (references) => {
    (process.emit as Function)(emitterCommands.ATTACH_REF_TO_TEST_RUN, references);
  },
  attachToTest: (attachments) => {
    (process.emit as Function)(emitterCommands.ATTACH_TO_TEST, attachments);
  },
  attachReferenceToTest: (references) => {
    (process.emit as Function)(emitterCommands.ATTACH_REF_TO_TEST, references);
  },
  revertTestRegistration: () => {
    (process.emit as Function)(emitterCommands.REVERT_TEST_REGISTRATION);
  },
};