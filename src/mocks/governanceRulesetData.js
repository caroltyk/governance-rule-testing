// Mock data in governance backend format for testing
export const mockGovernanceRuleset = {
  id: "6842fa4ddcbc0e000115bc63",
  name: "tyk-fapi-security-validation",
  description: "FAPI security validation rules for Tyk API Gateway",
  active: true,
  created_at: "2024-06-05T11:34:34Z",
  rules: [
    {
      id: "6842fa4ddcbc0e000115bc64",
      name: "tyk-fapi-dpopcheck-driver",
      description: "FAPI requires the middleware to use gRPC driver.",
      active: true,
      definition: `description: FAPI requires the middleware to use gRPC driver.
given: $.["x-tyk-api-gateway"].middleware.global.pluginConfig
message: Middleware must use gRPC driver.
severity: error
then:
    field: driver
    function: pattern
    functionOptions:
        match: ^grpc$`
    },
    {
      id: "6842fa4ddcbc0e000115bc65",
      name: "tyk-fapi-dpopcheck-plugin-exists",
      description: "FAPI requires the DPoPCheck middleware to be enabled.",
      active: true,
      definition: `description: FAPI requires the DPoPCheck middleware to be enabled.
given: $.["x-tyk-api-gateway"].middleware.global
message: DPoPCheck plugin must exist in prePlugins and be enabled.
severity: error
then:
    field: prePlugins
    function: schema
    functionOptions:
        schema:
            contains:
                properties:
                    enabled:
                        const: true
                    functionName:
                        const: DPoPCheck
                    rawBodyOnly:
                        const: true
                required:
                    - functionName
                    - enabled
                    - rawBodyOnly
                type: object
            type: array`
    },
    {
      id: "6842fa4ddcbc0e000115bc66",
      name: "tyk-jwt-auth-enabled-check",
      description: "Validates that JWT authentication is properly configured",
      active: true,
      definition: `description: Validates that JWT authentication is properly configured
given: $.["x-tyk-api-gateway"].server.authentication.securitySchemes.*
message: When JWT authentication is enabled, it must use ECDSA signing method
severity: error
then:
    - field: signingMethod
      function: schema
      functionOptions:
        forceValidation: true
        schema:
            const: ecdsa
            type: string
    - field: enabled
      function: schema
      functionOptions:
        forceValidation: true
        schema:
            const: true
            type: boolean`
    }
  ]
};

// Mock data in original format for comparison
export const mockOriginalRuleset = {
  id: "original-format-test",
  name: "vacuum-recommended",
  description: "Recommended rules from Vacuum",
  active: true,
  created_at: "2024-06-05T11:34:34Z",
  rules: {
    "tags-description": {
      description: "Tags must have a description.",
      given: "$.tags[*]",
      severity: "error",
      then: {
        field: "description",
        function: "truthy"
      }
    },
    "info-contact": {
      description: "Info object must have contact information.",
      given: "$.info",
      severity: "warn",
      then: {
        field: "contact",
        function: "truthy"
      }
    }
  }
};
