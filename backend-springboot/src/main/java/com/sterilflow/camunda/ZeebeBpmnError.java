package com.sterilflow.camunda;

public class ZeebeBpmnError extends RuntimeException {
    private final String errorCode;
    private final String errorMessage;

    public ZeebeBpmnError(String errorCode, String errorMessage) {
        super(errorCode + ": " + errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}