/*
 * @Author: Sid Li
 * @Date: 2025-08-08 10:28:51
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-23 13:48:56
 * @FilePath: \pic-demo-git\pic-demo\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

export function cameraList() {
  return request({
    url: "/api/get_camera_list",

    method: "get",
  });
}

export function imageInfo() {
  return request({
    url: "/api/get_image_info",
    method: "get",
  });
}

//token获取 FreeIeAPI
export function steps() {
  return request({
    url: "/api/get_process_steps",
    // url: "/get_process_steps",
    method: "get",
  });
}

export function fetchImage() {
  return request({
    url: "/api/get_fetch_image",
    // url: "/get_fetch_image",
    method: "get",
  });
}

export function processImage(data) {
  return request({
    url: "/api/process_image",
    // url: "/process_image",
    method: "post",
    data,
  });
}

export function stopImg(data) {
  return request({
    url: `/api/is_stop?stop=${data.stop}`,
    // url: `/is_stop?stop=${data.stop}`,
    method: "post",
  });
}
