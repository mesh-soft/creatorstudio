import type { Effects, State, Code } from 'micromark-util-types';
import { factorySpace } from 'micromark-factory-space';
import { factoryWhitespace } from 'micromark-factory-whitespace';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol/codes';
import { types } from 'micromark-util-symbol/types';

export function factoryAttributes(
  effects: Effects,
  ok: State,
  nnok: State,
  attributesType: string,
  attributesMarkerType: string,
  attributeType: string,
  attributeIdType: string,
  attributeClassType: string,
  attributeNameType: string,
  attributeInitializerType: string,
  attributeValueLiteralType: string,
  attributeValueType: string,
  attributeValueMarker: string,
  attributeValueData: string,
  disallowEol?: boolean
) {
  /** Tina shortcodes use extension-specific token names not declared on micromark's TokenTypeMap. */
  const enter = (name: string) =>
    effects.enter(name as Parameters<Effects['enter']>[0]);
  const exit = (name: string) =>
    effects.exit(name as Parameters<Effects['exit']>[0]);

  let type: string;
  let marker: Code | undefined;

  const nok: State = function (code) {
    return nnok(code);
  };

  const start: State = function (code) {
    enter(attributesType);
    return between(code);
  };

  const between: State = function (code) {
    if (code === codes.numberSign) {
      type = attributeIdType;
      return shortcutStart(code);
    }

    if (code === codes.dot) {
      type = attributeClassType;
      return shortcutStart(code);
    }

    if (code === codes.colon || code === codes.underscore || asciiAlpha(code)) {
      enter(attributeType);
      enter(attributeNameType);
      effects.consume(code);
      return name;
    }
    // Skip the name, go directly to the value
    if (code === codes.quotationMark || code === codes.apostrophe) {
      enter(attributeNameType);
      exit(attributeNameType);
      enter(attributeType);
      return valueBefore(code);
    }

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, between, types.whitespace)(code);
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, between)(code);
    }

    return end(code);
  };

  const shortcutStart: State = function (code) {
    enter(attributeType);
    enter(type);
    enter(type + 'Marker');
    effects.consume(code);
    exit(type + 'Marker');
    return shortcutStartAfter;
  };

  const shortcutStartAfter: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.numberSign ||
      code === codes.apostrophe ||
      code === codes.dot ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      return nok(code);
    }

    enter(type + 'Value');
    effects.consume(code);
    return shortcut;
  };

  const shortcut: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.apostrophe ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent
    ) {
      return nok(code);
    }

    if (
      code === codes.numberSign ||
      code === codes.dot ||
      code === codes.rightCurlyBrace ||
      markdownLineEndingOrSpace(code)
    ) {
      exit(type + 'Value');
      exit(type);
      exit(attributeType);
      return between(code);
    }

    effects.consume(code);
    return shortcut;
  };

  const name: State = function (code) {
    if (
      code === codes.dash ||
      code === codes.dot ||
      code === codes.colon ||
      code === codes.underscore ||
      asciiAlphanumeric(code)
    ) {
      effects.consume(code);
      return name;
    }

    exit(attributeNameType);

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, nameAfter, types.whitespace)(code);
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, nameAfter)(code);
    }

    return nameAfter(code);
  };

  const nameAfter: State = function (code) {
    if (code === codes.equalsTo) {
      enter(attributeInitializerType);
      effects.consume(code);
      exit(attributeInitializerType);
      return valueBefore;
    }

    // Attribute w/o value.
    exit(attributeType);
    return between(code);
  };

  const valueBefore: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent ||
      code === codes.rightCurlyBrace ||
      (disallowEol && markdownLineEnding(code))
    ) {
      return nok(code);
    }

    if (code === codes.quotationMark || code === codes.apostrophe) {
      enter(attributeValueLiteralType);
      enter(attributeValueMarker);
      effects.consume(code);
      exit(attributeValueMarker);
      marker = code;
      return valueQuotedStart;
    }

    if (disallowEol && markdownSpace(code)) {
      return factorySpace(effects, valueBefore, types.whitespace)(code);
    }

    if (!disallowEol && markdownLineEndingOrSpace(code)) {
      return factoryWhitespace(effects, valueBefore)(code);
    }

    enter(attributeValueType);
    enter(attributeValueData);
    effects.consume(code);
    marker = undefined;
    return valueUnquoted;
  };

  const valueUnquoted: State = function (code) {
    if (
      code === codes.eof ||
      code === codes.quotationMark ||
      code === codes.apostrophe ||
      code === codes.lessThan ||
      code === codes.equalsTo ||
      code === codes.greaterThan ||
      code === codes.graveAccent
    ) {
      return nok(code);
    }

    if (code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)) {
      exit(attributeValueData);
      exit(attributeValueType);
      exit(attributeType);
      return between(code);
    }

    effects.consume(code);
    return valueUnquoted;
  };

  const valueQuotedStart: State = function (code) {
    if (code === marker) {
      enter(attributeValueMarker);
      effects.consume(code);
      exit(attributeValueMarker);
      exit(attributeValueLiteralType);
      exit(attributeType);
      return valueQuotedAfter;
    }

    enter(attributeValueType);
    return valueQuotedBetween(code);
  };

  const valueQuotedBetween: State = function (code) {
    if (code === marker) {
      exit(attributeValueType);
      return valueQuotedStart(code);
    }

    if (code === codes.eof) {
      return nok(code);
    }

    // Note: blank lines can’t exist in content.
    if (markdownLineEnding(code)) {
      return disallowEol
        ? nok(code)
        : factoryWhitespace(effects, valueQuotedBetween)(code);
    }

    enter(attributeValueData);
    effects.consume(code);
    return valueQuoted;
  };

  const valueQuoted: State = function (code) {
    if (code === marker || code === codes.eof || markdownLineEnding(code)) {
      exit(attributeValueData);
      return valueQuotedBetween(code);
    }

    effects.consume(code);
    return valueQuoted;
  };

  const valueQuotedAfter: State = function (code) {
    return code === codes.rightCurlyBrace || markdownLineEndingOrSpace(code)
      ? between(code)
      : end(code);
  };

  const end: State = function (code) {
    if (!asciiAlpha(code)) {
      enter(attributesMarkerType);
      exit(attributesMarkerType);
      exit(attributesType);
      return ok(code);
    }

    return nok(code);
  };

  return start;
}
