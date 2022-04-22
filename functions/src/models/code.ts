/* eslint-disable require-jsdoc */
class Code {
  code: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;

  constructor(
    code: string,
    createdBy: string,
    createdAt: Date,
    isActive: boolean
  ) {
    this.code = code;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.isActive = isActive;

    return {
      code: this.code,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      isActive: this.isActive,
    };
  }
}
