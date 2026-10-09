/**
 * Standart API Yanıt Formatı (CommonResponse)
 */
class ApiResponse {
  constructor(statusCode, success, message, data = null, error = null) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(res, data = null, message = "İşlem başarılı", statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, true, message, data, null));
  }

  static created(res, data = null, message = "Kayıt başarıyla oluşturuldu") {
    return res.status(201).json(new ApiResponse(201, true, message, data, null));
  }

  static error(res, message = "Bir hata oluştu", statusCode = 500, error = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, false, message, null, error));
  }

  static badRequest(res, message = "Geçersiz istek parametreleri", error = null) {
    return res.status(400).json(new ApiResponse(400, false, message, null, error));
  }

  static unauthorized(res, message = "Yetkisiz erişim", error = null) {
    return res.status(401).json(new ApiResponse(401, false, message, null, error));
  }

  static notFound(res, message = "Kaynak bulunamadı", error = null) {
    return res.status(404).json(new ApiResponse(404, false, message, null, error));
  }
}

module.exports = ApiResponse;
