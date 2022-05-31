<?php

class Listings_model extends CI_Model
{

    private function callAPI($url, $data, $method)
    {
        $curl = curl_init();
        switch ($method) {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
                break;
            case "GET":
                if ($data) {
                    $url .= '?';
                    foreach ($data as $key => $val) {
                        $url .= $key . '=' . urlencode($val);
                    }
                } else {
                }
                break;
        }
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        if (curl_error($curl)) {
            $result = curl_error($curl);
        } else {
            $result = curl_exec($curl);
        }
        curl_close($curl);
        return $result;
    }
    private function getAllListings($options = FALSE)
    {
        $data = $options ? $options : array();
        try {
            $response = json_decode($this->callAPI('https://business.propertyhouse.co.za/public/api/listings/browse', $data, "GET"));
        } catch (Exception $e) {
            $response = $e->getMessage();
        }
        return $response;
    }
    public function get_listings($slug = FALSE)
    {
        if ($slug === FALSE) {
            $lisings  = $this->getAllListings();
            return $lisings;
        }
    }
}
