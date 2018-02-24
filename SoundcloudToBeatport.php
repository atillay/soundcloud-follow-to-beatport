<?php

set_time_limit(0);

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use GuzzleHttp\Client;

/**
 * Class SoundCloudToBeatport
 *
 * First it fetches
 *
 * Get your SC UserID : https://helgesverre.com/soundcloud/
 * Get a SC AppID : http://soundcloud.com/you/apps/new
 */
class SoundCloudToBeatport {

    public function __construct()
    {
        $this->http = new Client();
        $this->dotenv = new Dotenv(__DIR__);

        $this->dotenv->load();
    }

    public function export()
    {
        $results = [];
        $artists = $this->getSoundcloudFollowings();

        if (file_exists('log.txt')) unlink('log.txt');

        foreach ($artists as $key => $artist) {

            $res = $this->http->request('GET', sprintf('https://www.beatport.com/search/artists?q=%s', urlencode($artist)), [
                'headers' => ['X-PJAX' => true]
            ]);

            preg_match("/data-ec-id=\"(.*)\"/", $res->getBody(), $matchedId);
            preg_match("/data-ec-name=\"(.*)\"/", $res->getBody(), $matchedName);
            preg_match("/<a href=\"\/artist\/(.*)\//", $res->getBody(), $matchedSlug);

            if (count($matchedName) == 2 && count($matchedId) == 2 && count($matchedSlug) == 2) {
                if ($this->normalizeName($matchedName[1]) === $this->normalizeName($artist)) {
                    array_push($results, [
                        'id' => $matchedId[1],
                        'name' => $matchedName[1],
                        'slug' => $matchedSlug[1]
                    ]);

                    // Log
                    file_put_contents('log.txt', sprintf('%s (ID-%s) %s', $matchedName[1], $matchedId[1], PHP_EOL), FILE_APPEND | LOCK_EX);
                }
            }
        }

        $fp = fopen('export.json', 'w');
        fwrite($fp, json_encode($results));
        fclose($fp);

        echo 'Beatport artists to follow saved in : export.json';
    }

    private function getSoundcloudFollowings()
    {
        $results = [];
        $end = false;

        $url = sprintf('%s/users/%s/followings?client_id=%s',
            'https://api.soundcloud.com',
            getenv('SOUNDCLOUD_USER_ID'),
            getenv('SOUNDCLOUD_APP_ID')
        );

        while(!$end) {
            $res = $this->http->request('GET', $url);

            $followings = json_decode($res->getBody());

            foreach ($followings->collection as $following) {
                array_push($results, $following->username);
            }

            if ($followings->next_href) {
                $url = $followings->next_href;
            }
            else {
                $end = true;
            }
        }

        return $results;
    }

    private function normalizeName($name) {
        return strtolower(html_entity_decode(preg_replace('/\s+/', ' ', $name), ENT_QUOTES));
    }
}

(new SoundCloudToBeatport())->export();
