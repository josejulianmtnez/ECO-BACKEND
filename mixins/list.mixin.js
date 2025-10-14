"use strict"

module.exports = {
    name: "ListMixin",
    
    actions: {
        list: {
            rest: {
                method: "GET",
                path: "/list",
            },
            params: {
                detailed: { 
                    type: "boolean",
                    optional: true,
                    default: false,
                    convert: true
                }
            },
            async handler(ctx) {
                try {
                    const endpoints = []
                    const serviceName = this.name
                    
                    const actions = this.schema.actions || {}
                    
                    Object.keys(actions).forEach(actionName => {
                        const action = actions[actionName]
                        
                        if (action.rest) {
                            const endpoint = {
                                name: actionName,
                                method: action.rest.method,
                                path: `/api/${serviceName}${action.rest.path}`,
                                fullUrl: `${ctx.meta.$location?.origin || 'http://localhost:3500'}/api/${serviceName}${action.rest.path}`,
                                description: this.getActionDescription ? this.getActionDescription(actionName) : "Sin descripción"
                            }
                            
                            if (ctx.params.detailed && action.params) {
                                endpoint.parameters = {}
                                Object.keys(action.params).forEach(paramName => {
                                    const param = action.params[paramName]
                                    endpoint.parameters[paramName] = {
                                        type: param.type,
                                        required: !param.optional,
                                        default: param.default
                                    }
                                })
                            } else {
                                endpoint.parameters = action.params ? Object.keys(action.params) : []
                            }
                            
                            endpoints.push(endpoint)
                        }
                    })
                    
                    return {
                        service: serviceName,
                        version: "1.0.0",
                        totalEndpoints: endpoints.length,
                        endpoints: endpoints,
                        usage: {
                            listDetailed: `GET /api/${serviceName}/list?detailed=true`,
                            baseUrl: `/api/${serviceName}/`
                        }
                    }
                } catch (err) {
                    this.logger.error("Error en list:", err.message)
                    throw new Error(`Error al listar endpoints: ${err.message}`)
                }
            }
        }
    }
}
