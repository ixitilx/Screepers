'use strict';

exports.True = assertTrue
exports.Equal = assertEqual
exports.InstanceOf = assertInstanceOf
exports.Type = assertType
exports.Defined = assertDefined

function assertTrue(value)
{
    if(value !== true)
        throw new Error(`Assertion failed: Expected: true === ${value}`)
}

function assertEqual(a, b)
{
    if(a !== b)
        throw new Error(`Assertion failed. Expected: ${a} === ${b}`)
}

function assertInstanceOf(instance, constructor)
{
    if(!(instance instanceof constructor))
        throw new Error(`Assertion failed. Expected: ${instance} instanceof ${constructor}`)
}

function assertType(instance, typestring)
{
    if(typeof(instance) !== typestring)
        throw new Error(`Assertion failed. Expected typeof(${instance})==='${typestring}'`)
}

function assertDefined(value)
{
    if(_.isUndefined(value))
        throw new Error(`Assertion failed. Expected !_.isUndefined(${value})`)
}
