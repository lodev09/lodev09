<?php

use \Common\Util;

function is_post() {
	return REQUEST_METHOD === 'POST';
}

function parse_float($str) {
    $number = preg_replace('/[^0-9\.]/i', '', $str);
    return floatval($number);
}

function redirect($url) {
	Util::redirect($url);
}

function plog($msg = '', $newline = true, $options = [], $return = false) {
	$is_cli = Util::is_cli();
    $is_ajax = Util::is_ajax();
    $is_pjax = Util::is_pjax();

    $is_html = !($is_cli || $is_ajax) || $is_pjax;

	$result = Util::debug($msg, array_merge(['newline' => $newline], $options), true);
	$result = $is_html ? '<div class="debug">'.$result.'</div>' : $result;

	if ($return) return $result;
	else echo $result;
}

function get($field, $data = null, $default = null, $possible_values = []) {
	return Util::get($field, $data, $default, $possible_values);
}

function br2nl($text) {
	return Util::br2nl($text);
}

function array_delete($array, $items) {
    return array_diff($array, is_array($items) ? $items : [$items]);
}

function from_now($date) {
	if ($date) {
		try {
			$moment = new \Moment\Moment($date);
			if ($moment->getTimeStamp() > 0) {
				return $moment->fromNow()->getRelative();
			}
		} catch (Exception $ex) {
			trigger_error($ex->getMessage());
		}
	}

	return 'unknown';
}

// formatted datetime
function dt($date, $format = \Moment\Moment::NO_TZ_MYSQL) {
	if ($date) {
		try {
			$dt = $date instanceof DateTime ? $date : new \Moment\Moment($date);
			return $dt->format($format);
		} catch (Exception $ex) {
			trigger_error($ex->getMessage());
		}
	}

	return null;
}

function token($length = 16) {
	return Util::token($length);
}

function uuid() {
	return Util::uuid();
}

function escape($str, $nl2br = false) {
	return Util::escape_html($str, $nl2br);
}

if (!function_exists('money_format')) {
    function money_format($format, $number) {
        $regex  = '/%((?:[\^!\-]|\+|\(|\=.)*)([0-9]+)?'.
                  '(?:#([0-9]+))?(?:\.([0-9]+))?([in%])/';
        if (setlocale(LC_MONETARY, 0) == 'C') {
            setlocale(LC_MONETARY, '');
        }
        $locale = localeconv();
        preg_match_all($regex, $format, $matches, PREG_SET_ORDER);
        foreach ($matches as $fmatch) {
            $value = floatval($number);
            $flags = array(
                'fillchar'  => preg_match('/\=(.)/', $fmatch[1], $match) ?
                               $match[1] : ' ',
                'nogroup'   => preg_match('/\^/', $fmatch[1]) > 0,
                'usesignal' => preg_match('/\+|\(/', $fmatch[1], $match) ?
                               $match[0] : '+',
                'nosimbol'  => preg_match('/\!/', $fmatch[1]) > 0,
                'isleft'    => preg_match('/\-/', $fmatch[1]) > 0
            );
            $width      = trim($fmatch[2]) ? (int)$fmatch[2] : 0;
            $left       = trim($fmatch[3]) ? (int)$fmatch[3] : 0;
            $right      = trim($fmatch[4]) ? (int)$fmatch[4] : $locale['int_frac_digits'];
            $conversion = $fmatch[5];

            $positive = true;
            if ($value < 0) {
                $positive = false;
                $value  *= -1;
            }
            $letter = $positive ? 'p' : 'n';

            $prefix = $suffix = $cprefix = $csuffix = $signal = '';

            $signal = $positive ? $locale['positive_sign'] : $locale['negative_sign'];
            switch (true) {
                case $locale["{$letter}_sign_posn"] == 1 && $flags['usesignal'] == '+':
                    $prefix = $signal;
                    break;
                case $locale["{$letter}_sign_posn"] == 2 && $flags['usesignal'] == '+':
                    $suffix = $signal;
                    break;
                case $locale["{$letter}_sign_posn"] == 3 && $flags['usesignal'] == '+':
                    $cprefix = $signal;
                    break;
                case $locale["{$letter}_sign_posn"] == 4 && $flags['usesignal'] == '+':
                    $csuffix = $signal;
                    break;
                case $flags['usesignal'] == '(':
                case $locale["{$letter}_sign_posn"] == 0:
                    $prefix = '(';
                    $suffix = ')';
                    break;
            }
            if (!$flags['nosimbol']) {
                $currency = $cprefix .
                            ($conversion == 'i' ? $locale['int_curr_symbol'] : $locale['currency_symbol']) .
                            $csuffix;
            } else {
                $currency = '';
            }
            $space  = $locale["{$letter}_sep_by_space"] ? ' ' : '';

            $value = number_format($value, $right, $locale['mon_decimal_point'],
                     $flags['nogroup'] ? '' : $locale['mon_thousands_sep']);
            $value = @explode($locale['mon_decimal_point'], $value);

            $n = strlen($prefix) + strlen($currency) + strlen($value[0]);
            if ($left > 0 && $left > $n) {
                $value[0] = str_repeat($flags['fillchar'], $left - $n) . $value[0];
            }
            $value = implode($locale['mon_decimal_point'], $value);
            if ($locale["{$letter}_cs_precedes"]) {
                $value = $prefix . $currency . $space . $value . $suffix;
            } else {
                $value = $prefix . $value . $space . $currency . $suffix;
            }
            if ($width > 0) {
                $value = str_pad($value, $width, $flags['fillchar'], $flags['isleft'] ?
                         STR_PAD_RIGHT : STR_PAD_LEFT);
            }

            $format = str_replace($fmatch[0], $value, $format);
        }
        return $format;
    }
}

?>